import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import type { KnowledgeCatalog } from '@unpopping-candy/knowledge';
import type { ValidationIssue, ValidationReport } from './types.ts';

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'coverage', 'storybook-static']);
const COLOR_PATTERN = /(?:#[0-9a-f]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\()/gi;
const DEEP_IMPORT_PATTERN = /@unpopping-candy\/[a-z-]+\/(?:src|dist)\//g;

interface ProjectValidationConfig {
  exclude: readonly string[];
  allowedEntrypoints: readonly string[];
}

function normalizePath(value: string): string {
  return value.replaceAll('\\', '/').replace(/^\.\//, '');
}

function globPattern(pattern: string): RegExp {
  const normalized = normalizePath(pattern);
  let output = '^';
  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized.charAt(index);
    const next = normalized[index + 1];
    if (character === '*' && next === '*') {
      if (normalized[index + 2] === '/') {
        output += '(?:.*/)?';
        index += 2;
      } else {
        output += '.*';
        index += 1;
      }
      continue;
    }
    if (character === '*') { output += '[^/]*'; continue; }
    if (character === '?') { output += '[^/]'; continue; }
    output += character.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
  }
  return new RegExp(`${output}$`);
}

function cleanStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim()))]
    : [];
}

async function readValidationConfig(root: string): Promise<ProjectValidationConfig> {
  for (const name of ['popcandy.config.json', 'popcandy.json']) {
    try {
      const parsed = JSON.parse(await readFile(join(root, name), 'utf8')) as Record<string, unknown>;
      const validation = parsed.validation;
      if (!validation || typeof validation !== 'object') return { exclude: [], allowedEntrypoints: [] };
      const record = validation as Record<string, unknown>;
      return {
        exclude: cleanStringArray(record.exclude),
        allowedEntrypoints: cleanStringArray(record.allowedEntrypoints),
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw new Error(`Unable to parse ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  return { exclude: [], allowedEntrypoints: [] };
}

async function collectSourceFiles(root: string, exclude: readonly string[]): Promise<string[]> {
  const files: string[] = [];
  const exclusionPatterns = exclude.map(globPattern);
  const isExcluded = (path: string) => exclusionPatterns.some((pattern) => pattern.test(normalizePath(relative(root, path))));
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const path = join(directory, entry.name);
      if (isExcluded(path) || (entry.isDirectory() && isExcluded(`${path}/`))) continue;
      if (entry.isDirectory()) await visit(path);
      else if (SOURCE_EXTENSIONS.has(extname(entry.name))) files.push(path);
    }
  }
  await visit(root);
  return files.sort((a, b) => a.localeCompare(b));
}

function lineOf(source: string, index: number): number {
  return source.slice(0, index).split('\n').length;
}

function allowedEntrypoints(catalog: KnowledgeCatalog, additional: readonly string[]): Set<string> {
  return new Set([
    '@unpopping-candy/tokens', '@unpopping-candy/tokens/styles.css', '@unpopping-candy/tokens/tokens.json',
    '@unpopping-candy/theme', '@unpopping-candy/icons', '@unpopping-candy/icons/styles.css',
    '@unpopping-candy/ui/styles.css', '@unpopping-candy/social/model', '@unpopping-candy/social/styles.css',
    ...catalog.entries.flatMap((entry) => entry.kind === 'component' ? entry.entrypoints : []),
    ...additional,
  ]);
}

function inspectSource(source: string, file: string, root: string, allowed: Set<string>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const match of source.matchAll(DEEP_IMPORT_PATTERN)) issues.push({
    code: 'deep-import', severity: 'error', file: relative(root, file), line: lineOf(source, match.index ?? 0),
    message: `Private Unpopping Candy import is not a public contract: ${match[0]}`,
    guidance: 'Import from a documented package entrypoint.',
  });
  for (const match of source.matchAll(/(?:from\s*|import\s*)['"](@unpopping-candy\/[a-z-]+(?:\/[a-z0-9.-]+)*)['"]/g)) {
    const specifier = match[1];
    if (specifier?.includes('/src/') || specifier?.includes('/dist/')) continue;
    if (specifier && !allowed.has(specifier)) issues.push({
      code: 'unknown-entrypoint', severity: 'error', file: relative(root, file), line: lineOf(source, match.index ?? 0),
      message: `Unknown Unpopping Candy entrypoint: ${specifier}`,
      guidance: 'Use popcandy get or popcandy search to find the exact installed-version import.',
    });
  }
  if (!file.endsWith('.docs.ts') && !file.includes('/packages/tokens/')) {
    for (const match of source.matchAll(COLOR_PATTERN)) issues.push({
      code: 'hardcoded-color', severity: 'warning', file: relative(root, file), line: lineOf(source, match.index ?? 0),
      message: `Hardcoded color value: ${match[0]}`,
      guidance: 'Use a semantic --popcandy-* token unless the color belongs to authored content or data visualization.',
    });
  }
  if (/className\s*=\s*['"][^'"]*(?:rounded-3xl|shadow-2xl|backdrop-blur|bg-gradient)/.test(source)) issues.push({
    code: 'generic-ai-ui-style', severity: 'warning', file: relative(root, file),
    message: 'Detected generic decorative utility styling that conflicts with the restrained Unpopping Candy visual language.',
    guidance: 'Prefer Unpopping Candy composition primitives and semantic tokens.',
  });
  return issues;
}

export async function validatePopcandyProject(catalog: KnowledgeCatalog, targetPath: string): Promise<ValidationReport> {
  const root = resolve(targetPath);
  const config = await readValidationConfig(root);
  const files = await collectSourceFiles(root, config.exclude);
  const allowed = allowedEntrypoints(catalog, config.allowedEntrypoints);
  const issues: ValidationIssue[] = [];
  for (const file of files) issues.push(...inspectSource(await readFile(file, 'utf8'), file, root, allowed));
  return {
    root,
    filesScanned: files.length,
    issues,
    summary: {
      errors: issues.filter((issue) => issue.severity === 'error').length,
      warnings: issues.filter((issue) => issue.severity === 'warning').length,
    },
  };
}
