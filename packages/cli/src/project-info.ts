import { access, readFile } from 'node:fs/promises';
import { dirname, join, parse, resolve } from 'node:path';
import type { CommonspaceProjectInfo } from './types.ts';

async function exists(path: string): Promise<boolean> {
  try { await access(path); return true; } catch { return false; }
}

async function readJson(path: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>;
}

function dependenciesOf(manifest: Record<string, unknown>): Record<string, string> {
  const output: Record<string, string> = {};
  for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const group = manifest[key];
    if (!group || typeof group !== 'object') continue;
    for (const [name, version] of Object.entries(group as Record<string, unknown>)) if (typeof version === 'string') output[name] = version;
  }
  return output;
}

async function detectPackageManager(root: string, manifest: Record<string, unknown>): Promise<CommonspaceProjectInfo['packageManager']> {
  const declared = typeof manifest.packageManager === 'string' ? manifest.packageManager.split('@')[0] : null;
  if (declared === 'pnpm' || declared === 'npm' || declared === 'yarn' || declared === 'bun') return declared;
  if (await exists(join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (await exists(join(root, 'yarn.lock'))) return 'yarn';
  if (await exists(join(root, 'bun.lockb')) || await exists(join(root, 'bun.lock'))) return 'bun';
  if (await exists(join(root, 'package-lock.json'))) return 'npm';
  return 'unknown';
}

function detectFramework(dependencies: Record<string, string>): CommonspaceProjectInfo['framework'] {
  if ('vite' in dependencies && 'react' in dependencies) return 'vite-react';
  if ('next' in dependencies && 'react' in dependencies) return 'next-react';
  if ('react' in dependencies) return 'react';
  return 'unknown';
}

async function findRoot(startDirectory: string): Promise<string> {
  let current = resolve(startDirectory);
  if (!(await exists(current))) throw new Error(`Start directory does not exist: ${current}`);
  while (true) {
    if (await exists(join(current, 'package.json'))) return current;
    const parent = dirname(current);
    if (parent === current || parse(current).root === current) throw new Error(`No package.json found above ${startDirectory}`);
    current = parent;
  }
}

function collectInstalled(dependencies: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(dependencies).filter(([name]) => name.startsWith('@commonspace/')).sort(([a], [b]) => a.localeCompare(b)));
}

export async function detectCommonspaceProject(startDirectory = process.cwd()): Promise<CommonspaceProjectInfo> {
  const root = await findRoot(startDirectory);
  const manifest = await readJson(join(root, 'package.json'));
  const dependencies = dependenciesOf(manifest);
  const configCandidates = ['commonspace.config.json', 'commonspace.json'];
  const configPath = (await Promise.all(configCandidates.map(async (name) => (await exists(join(root, name)) ? join(root, name) : null)))).find(Boolean) ?? null;
  const sourceDirectories: string[] = [];
  for (const name of ['src', 'app', 'pages']) if (await exists(join(root, name))) sourceDirectories.push(name);
  const cssCandidates = ['src/main.tsx', 'src/main.ts', 'src/index.tsx', 'app/layout.tsx'];
  const styleImports = new Set<string>();
  for (const candidate of cssCandidates) {
    const path = join(root, candidate);
    if (!(await exists(path))) continue;
    const source = await readFile(path, 'utf8');
    for (const match of source.matchAll(/['"](@commonspace\/[a-z-]+\/styles\.css)['"]/g)) if (match[1]) styleImports.add(match[1]);
  }
  return {
    root,
    packageManager: await detectPackageManager(root, manifest),
    framework: detectFramework(dependencies),
    packageName: typeof manifest.name === 'string' ? manifest.name : null,
    configPath,
    installed: collectInstalled(dependencies),
    sourceDirectories: sourceDirectories.length ? sourceDirectories : ['src'],
    styleImports: [...styleImports].sort(),
  };
}
