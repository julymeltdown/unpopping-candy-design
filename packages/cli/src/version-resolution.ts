import { access, readFile, realpath } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, parse, resolve } from 'node:path';
import { parseDocument } from 'yaml';
import { PopcandyProjectError } from './project-errors.ts';

export type VersionResolutionSource = 'manifest' | 'npm-lock-v3' | 'pnpm-lock-v9' | 'none';

export interface InstalledPopcandyVersions {
  readonly versions: Readonly<Record<string, string>>;
  readonly source: VersionResolutionSource;
  readonly evidencePaths: readonly string[];
}

type JsonRecord = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNodeError(value: unknown, code: string): boolean {
  return value instanceof Error && isRecord(value) && value.code === code;
}

function isEsmOnlyResolutionError(value: unknown): boolean {
  return isNodeError(value, 'ERR_PACKAGE_PATH_NOT_EXPORTED');
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (isNodeError(error, 'ENOENT')) return false;
    throw error;
  }
}

async function readJsonRecord(path: string): Promise<JsonRecord> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));
  if (!isRecord(parsed)) throw new PopcandyProjectError('POPCANDY_LOCKFILE_UNSUPPORTED', `Expected an object in ${path}.`);
  return parsed;
}

function exactVersion(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const match = /^(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?:\([^)]*\))?$/.exec(value);
  return match?.[1];
}

function namesInOrder(declaredNames: readonly string[]): readonly string[] {
  return [...new Set(declaredNames)].sort();
}

async function findPackageManifest(entryPath: string, packageName: string): Promise<string | undefined> {
  let current = dirname(entryPath);
  while (true) {
    const manifestPath = join(current, 'package.json');
    if (await pathExists(manifestPath)) {
      const manifest = await readJsonRecord(manifestPath);
      if (manifest.name === packageName && typeof manifest.version === 'string') return manifestPath;
    }
    const parent = dirname(current);
    if (parent === current || parse(current).root === current) return undefined;
    current = parent;
  }
}

async function findInstalledPackageManifest(root: string, packageName: string): Promise<string | undefined> {
  const installedManifestPath = join(root, 'node_modules', packageName, 'package.json');
  if (!(await pathExists(installedManifestPath))) return undefined;
  const manifestPath = await realpath(installedManifestPath);
  const manifest = await readJsonRecord(manifestPath);
  return manifest.name === packageName && typeof manifest.version === 'string' ? manifestPath : undefined;
}

async function resolveManifestVersions(root: string, names: readonly string[]): Promise<InstalledPopcandyVersions | undefined> {
  const requireFromRoot = createRequire(join(root, 'package.json'));
  const evidence: string[] = [];
  const versions: Record<string, string> = {};
  for (const packageName of names) {
    let entryPath: string;
    try {
      entryPath = requireFromRoot.resolve(packageName);
    } catch (error) {
      if (isNodeError(error, 'MODULE_NOT_FOUND')) return undefined;
      if (isEsmOnlyResolutionError(error)) {
        const manifestPath = await findInstalledPackageManifest(root, packageName);
        if (!manifestPath) return undefined;
        const manifest = await readJsonRecord(manifestPath);
        if (typeof manifest.version !== 'string') return undefined;
        versions[packageName] = manifest.version;
        evidence.push(manifestPath);
        continue;
      }
      throw error;
    }
    const manifestPath = await findPackageManifest(entryPath, packageName);
    if (!manifestPath) return undefined;
    const manifest = await readJsonRecord(manifestPath);
    if (typeof manifest.version !== 'string') return undefined;
    versions[packageName] = manifest.version;
    evidence.push(manifestPath);
  }
  return { versions, source: 'manifest', evidencePaths: evidence.sort() };
}

async function hasUnresolvedAlias(root: string, names: readonly string[]): Promise<boolean> {
  const manifest = await readJsonRecord(join(root, 'package.json'));
  const groups = ['dependencies', 'devDependencies', 'peerDependencies'];
  return groups.some((groupName) => {
    const group = manifest[groupName];
    return isRecord(group) && names.some((name) => typeof group[name] === 'string' && group[name].startsWith('npm:'));
  });
}

async function resolveNpmLockfile(root: string, names: readonly string[]): Promise<InstalledPopcandyVersions | undefined> {
  const lockfilePath = join(root, 'package-lock.json');
  if (!(await pathExists(lockfilePath))) return undefined;
  const lockfile = await readJsonRecord(lockfilePath);
  if (lockfile.lockfileVersion !== 3) throw new PopcandyProjectError('POPCANDY_LOCKFILE_UNSUPPORTED', 'Only npm package-lock.json lockfileVersion 3 is supported. Reinstall with npm 10 or 11.');
  if (await hasUnresolvedAlias(root, names)) throw new PopcandyProjectError('POPCANDY_LOCKFILE_UNSUPPORTED', 'npm aliases must be materialized in node_modules before resolving Unpopping Candy versions.');
  const packages = lockfile.packages;
  if (!isRecord(packages)) throw new PopcandyProjectError('POPCANDY_LOCKFILE_UNSUPPORTED', 'npm lockfile v3 is missing its packages table.');
  const versions: Record<string, string> = {};
  for (const name of names) {
    const entry = packages[`node_modules/${name}`];
    if (!isRecord(entry) || typeof entry.version !== 'string') return undefined;
    const version = exactVersion(entry.version);
    if (!version) throw new PopcandyProjectError('POPCANDY_LOCKFILE_UNSUPPORTED', `npm lockfile v3 has an unresolved version alias for ${name}.`);
    versions[name] = version;
  }
  return { versions, source: 'npm-lock-v3', evidencePaths: [lockfilePath] };
}

async function resolvePnpmLockfile(root: string, names: readonly string[]): Promise<InstalledPopcandyVersions | undefined> {
  const lockfilePath = join(root, 'pnpm-lock.yaml');
  if (!(await pathExists(lockfilePath))) return undefined;
  const document = parseDocument(await readFile(lockfilePath, 'utf8'));
  if (document.errors.length > 0) throw new PopcandyProjectError('POPCANDY_LOCKFILE_UNSUPPORTED', 'pnpm-lock.yaml could not be parsed. Regenerate it with pnpm 11.');
  const lockfile: unknown = document.toJS();
  if (!isRecord(lockfile) || lockfile.lockfileVersion !== '9.0') throw new PopcandyProjectError('POPCANDY_LOCKFILE_UNSUPPORTED', 'Only pnpm-lock.yaml lockfileVersion 9 is supported. Reinstall with pnpm 11.');
  const importers = lockfile.importers;
  if (!isRecord(importers) || !isRecord(importers['.'])) throw new PopcandyProjectError('POPCANDY_LOCKFILE_UNSUPPORTED', 'pnpm lockfile v9 is missing the root importer.');
  const importer = importers['.'];
  const dependencyGroups = ['dependencies', 'devDependencies', 'optionalDependencies'];
  const versions: Record<string, string> = {};
  for (const name of names) {
    const entry = dependencyGroups.map((group) => importer[group]).find((group): group is JsonRecord => isRecord(group) && name in group)?.[name];
    const snapshot = isRecord(entry) ? entry.version : entry;
    const version = exactVersion(snapshot);
    if (snapshot !== undefined && !version) throw new PopcandyProjectError('POPCANDY_LOCKFILE_UNSUPPORTED', `pnpm lockfile v9 has an unresolved version alias for ${name}.`);
    if (!version) return undefined;
    versions[name] = version;
  }
  return { versions, source: 'pnpm-lock-v9', evidencePaths: [lockfilePath] };
}

export async function resolveInstalledPopcandyVersions(root: string, declaredNames: readonly string[]): Promise<InstalledPopcandyVersions> {
  const names = namesInOrder(declaredNames);
  if (names.length === 0) return { versions: {}, source: 'none', evidencePaths: [] };
  const projectManifest = join(root, 'package.json');
  if (!(await pathExists(projectManifest))) throw new PopcandyProjectError('POPCANDY_PROJECT_NOT_FOUND', `No package.json found at ${resolve(projectManifest)}.`);
  if (await pathExists(join(root, '.pnp.cjs'))) throw new PopcandyProjectError('POPCANDY_PNP_UNSUPPORTED', 'Yarn Plug\'n\'Play is unsupported. Use Yarn node-modules linker or install node_modules.');
  const manifestResult = await resolveManifestVersions(root, names);
  if (manifestResult) return manifestResult;
  const npmResult = await resolveNpmLockfile(root, names);
  if (npmResult) return npmResult;
  const pnpmResult = await resolvePnpmLockfile(root, names);
  if (pnpmResult) return pnpmResult;
  if (await pathExists(join(root, 'yarn.lock')) || await pathExists(join(root, 'bun.lock')) || await pathExists(join(root, 'bun.lockb'))) {
    throw new PopcandyProjectError('POPCANDY_LOCKFILE_UNSUPPORTED', 'This lockfile requires materialized node_modules or a supported npm v3 or pnpm v9 lockfile.');
  }
  throw new PopcandyProjectError('POPCANDY_DEPENDENCIES_NOT_INSTALLED', 'Declared Unpopping Candy packages are not installed. Run your package manager install command.');
}
