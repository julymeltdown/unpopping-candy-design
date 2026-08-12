import { access, readFile } from 'node:fs/promises';
import { dirname, join, parse, resolve } from 'node:path';
import { PopcandyProjectError } from './project-errors.ts';
import type { PopcandyProjectInfo } from './types.ts';
import { resolveInstalledPopcandyVersions } from './version-resolution.ts';

function isNodeError(value: unknown, code: string): boolean {
  return value instanceof Error && typeof value === 'object' && 'code' in value && value.code === code;
}

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (isNodeError(error, 'ENOENT')) return false;
    throw error;
  }
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(path: string): Promise<Readonly<Record<string, unknown>>> {
  const parsed: unknown = JSON.parse(await readFile(path, 'utf8'));
  if (!isRecord(parsed)) throw new PopcandyProjectError('POPCANDY_PROJECT_NOT_FOUND', `Expected an object in ${path}.`);
  return parsed;
}

function dependenciesOf(manifest: Record<string, unknown>): Record<string, string> {
  const output: Record<string, string> = {};
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const group = manifest[key];
    if (!isRecord(group)) continue;
    for (const [name, version] of Object.entries(group)) if (typeof version === 'string') output[name] = version;
  }
  return output;
}

async function detectPackageManager(root: string, manifest: Record<string, unknown>): Promise<PopcandyProjectInfo['packageManager']> {
  const declared = typeof manifest.packageManager === 'string' ? manifest.packageManager.split('@')[0] : null;
  if (declared === 'pnpm' || declared === 'npm' || declared === 'yarn' || declared === 'bun') return declared;
  if (await exists(join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await exists(join(root, 'yarn.lock'))) return 'yarn';
  if (await exists(join(root, 'bun.lockb')) || await exists(join(root, 'bun.lock'))) return 'bun';
  if (await exists(join(root, 'package-lock.json'))) return 'npm';
  return 'unknown';
}

function detectFramework(dependencies: Record<string, string>): PopcandyProjectInfo['framework'] {
  if ('vite' in dependencies && 'react' in dependencies) return 'vite-react';
  if ('next' in dependencies && 'react' in dependencies) return 'next-react';
  if ('react' in dependencies) return 'react';
  return 'unknown';
}

async function findRoot(startDirectory: string): Promise<string> {
  let current = resolve(startDirectory);
  if (!(await exists(current))) throw new PopcandyProjectError('POPCANDY_PROJECT_NOT_FOUND', `Start directory does not exist: ${current}`);
  while (true) {
    if (await exists(join(current, 'package.json'))) return current;
    const parent = dirname(current);
    if (parent === current || parse(current).root === current) throw new PopcandyProjectError('POPCANDY_PROJECT_NOT_FOUND', `No package.json found above ${startDirectory}`);
    current = parent;
  }
}

function declaredPopcandyNames(dependencies: Readonly<Record<string, string>>): readonly string[] {
  return Object.keys(dependencies).filter((name) => name.startsWith('@unpopping-candy/')).sort();
}

export async function detectPopcandyProject(startDirectory = process.cwd()): Promise<PopcandyProjectInfo> {
  const root = await findRoot(startDirectory);
  const manifest = await readJson(join(root, 'package.json'));
  const dependencies = dependenciesOf(manifest);
  const versionResolution = await resolveInstalledPopcandyVersions(root, declaredPopcandyNames(dependencies));
  const configCandidates = ['popcandy.config.json', 'popcandy.json'];
  const configPath = (await Promise.all(configCandidates.map(async (name) => (await exists(join(root, name)) ? join(root, name) : null)))).find(Boolean) ?? null;
  const sourceDirectories: string[] = [];
  for (const name of ['src', 'app', 'pages']) if (await exists(join(root, name))) sourceDirectories.push(name);
  const cssCandidates = ['src/main.tsx', 'src/main.ts', 'src/index.tsx', 'app/layout.tsx'];
  const styleImports = new Set<string>();
  for (const candidate of cssCandidates) {
    const path = join(root, candidate);
    if (!(await exists(path))) continue;
    const source = await readFile(path, 'utf8');
    for (const match of source.matchAll(/['"](@unpopping-candy\/[a-z-]+\/styles\.css)['"]/g)) if (match[1]) styleImports.add(match[1]);
  }
  return {
    root,
    packageManager: await detectPackageManager(root, manifest),
    framework: detectFramework(dependencies),
    packageName: typeof manifest.name === 'string' ? manifest.name : null,
    configPath,
    installed: versionResolution.versions,
    versionResolutionSource: versionResolution.source,
    sourceDirectories: sourceDirectories.length ? sourceDirectories : ['src'],
    styleImports: [...styleImports].sort(),
  };
}
