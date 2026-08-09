import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';

const SKIP_DIRECTORIES = new Set(['.git', 'build', 'coverage', 'dist', 'node_modules', 'storybook-static']);

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function listFiles(directory, predicate = () => true) {
  const output = [];
  async function walk(current) {
    for (const name of await readdir(current)) {
      const path = join(current, name);
      const info = await stat(path);
      if (info.isDirectory() && !SKIP_DIRECTORIES.has(name)) await walk(path);
      else if (predicate(path)) output.push(path);
    }
  }
  await walk(directory);
  return output.sort();
}

export function extractModuleSpecifiers(source) {
  const results = new Set();
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g,
    /import\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) results.add(match[1]);
  }
  return [...results];
}

export function packageNameFromSpecifier(specifier) {
  if (specifier.startsWith('@')) return specifier.split('/').slice(0, 2).join('/');
  return specifier.split('/')[0];
}

export function relativePath(root, path) {
  return relative(root, path).replaceAll('\\', '/');
}

export function isSourceFile(path) {
  return ['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(path));
}

export function repositoryRoot() {
  return resolve(import.meta.dirname, '../..');
}
