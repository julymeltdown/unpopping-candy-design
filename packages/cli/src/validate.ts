import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve } from 'node:path';
import type { KnowledgeCatalog } from '@commonspace/knowledge';
import type { ValidationIssue, ValidationReport } from './types.ts';

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.css']);
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'build', '.next', 'coverage', 'storybook-static']);
const COLOR_PATTERN = /(?:#[0-9a-f]{3,8}\b|\brgba?\s*\(|\bhsla?\s*\()/gi;
const DEEP_IMPORT_PATTERN = /@commonspace\/[a-z-]+\/(?:src|dist)\//g;

async function collectSourceFiles(root: string): Promise<string[]> {
  const files: string[] = [];
  async function visit(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const path = join(directory, entry.name);
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

function allowedEntrypoints(catalog: KnowledgeCatalog): Set<string> {
  return new Set([
    '@commonspace/tokens', '@commonspace/tokens/styles.css', '@commonspace/tokens/tokens.json',
    '@commonspace/theme', '@commonspace/icons', '@commonspace/icons/styles.css',
    '@commonspace/ui/styles.css', '@commonspace/social/styles.css',
    ...catalog.entries.flatMap((entry) => entry.kind === 'component' ? entry.entrypoints : []),
  ]);
}

function inspectSource(source: string, file: string, root: string, allowed: Set<string>): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const match of source.matchAll(DEEP_IMPORT_PATTERN)) issues.push({
    code: 'deep-import', severity: 'error', file: relative(root, file), line: lineOf(source, match.index ?? 0),
    message: `Private Commonspace import is not a public contract: ${match[0]}`,
    guidance: 'Import from a documented package entrypoint.',
  });
  for (const match of source.matchAll(/(?:from\s*|import\s*)['"](@commonspace\/[a-z-]+(?:\/[a-z0-9.-]+)*)['"]/g)) {
    const specifier = match[1];
    if (specifier && !allowed.has(specifier)) issues.push({
      code: 'unknown-entrypoint', severity: 'error', file: relative(root, file), line: lineOf(source, match.index ?? 0),
      message: `Unknown Commonspace entrypoint: ${specifier}`,
      guidance: 'Use commonspace get or commonspace search to find the exact installed-version import.',
    });
  }
  if (!file.endsWith('.docs.ts') && !file.includes('/packages/tokens/')) {
    for (const match of source.matchAll(COLOR_PATTERN)) issues.push({
      code: 'hardcoded-color', severity: 'warning', file: relative(root, file), line: lineOf(source, match.index ?? 0),
      message: `Hardcoded color value: ${match[0]}`,
      guidance: 'Use a semantic --cs-* token unless the color belongs to authored content or data visualization.',
    });
  }
  if (/className\s*=\s*['"][^'"]*(?:rounded-3xl|shadow-2xl|backdrop-blur|bg-gradient)/.test(source)) issues.push({
    code: 'generic-ai-ui-style', severity: 'warning', file: relative(root, file),
    message: 'Detected generic decorative utility styling that conflicts with the restrained Commonspace visual language.',
    guidance: 'Prefer Commonspace composition primitives and semantic tokens.',
  });
  return issues;
}

export async function validateCommonspaceProject(catalog: KnowledgeCatalog, targetPath: string): Promise<ValidationReport> {
  const root = resolve(targetPath);
  const files = await collectSourceFiles(root);
  const allowed = allowedEntrypoints(catalog);
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
