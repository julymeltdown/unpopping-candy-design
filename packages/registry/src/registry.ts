import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, realpath, stat, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TemplateDoc } from '@commonspace/knowledge';
import type {
  RegistryFileManifest,
  RegistryManifest,
  RegistryService,
  RegistryServiceOptions,
  RegistryTemplateManifest,
  ScaffoldFilePlan,
  ScaffoldInput,
  ScaffoldResult,
} from './types.ts';

const SOURCE_PREFIX = 'packages/registry/templates/';
const VARIABLE_PATTERN = /\{\{([A-Za-z][A-Za-z0-9_]*)\}\}/g;

function digest(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

function normalizeRelativePath(value: string, label: string, allowDot = true): string {
  if (value.includes('\0')) throw new Error(`${label} contains a NUL byte.`);
  if (isAbsolute(value)) throw new Error(`${label} must be relative to the project root.`);
  const normalized = value.replaceAll('\\', '/').replace(/^\.\//, '');
  if (!allowDot && (!normalized || normalized === '.')) throw new Error(`${label} must not be empty.`);
  const segments = normalized.split('/').filter((segment) => segment !== '' && segment !== '.');
  if (segments.includes('..')) throw new Error(`${label} must stay inside the project root.`);
  return segments.join('/') || '.';
}

function isWithin(root: string, target: string): boolean {
  const path = relative(root, target);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

async function exists(path: string): Promise<boolean> {
  try { await lstat(path); return true; } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw error;
  }
}

async function assertProjectRoot(projectRoot: string): Promise<string> {
  const root = resolve(projectRoot);
  const information = await stat(root);
  if (!information.isDirectory()) throw new Error('projectRoot must resolve to a directory.');
  return realpath(root);
}

async function assertNoSymlinkEscape(root: string, target: string): Promise<void> {
  if (!isWithin(root, target)) throw new Error('Target path must stay inside the project root.');
  let current = target;
  while (isWithin(root, current) && current !== root) {
    if (await exists(current)) {
      const information = await lstat(current);
      if (information.isSymbolicLink()) throw new Error(`Target path crosses a symlink: ${relative(root, current)}`);
      const resolved = await realpath(current);
      if (!isWithin(root, resolved)) throw new Error('Target path resolves outside the project root.');
    }
    current = dirname(current);
  }
}

function validateSource(source: string): string {
  const normalized = normalizeRelativePath(source, 'Registry source', false);
  if (!normalized.startsWith(SOURCE_PREFIX)) throw new Error(`Unsafe registry source. Expected ${SOURCE_PREFIX} prefix: ${source}`);
  return normalized.slice(SOURCE_PREFIX.length);
}

function templateEntries(options: RegistryServiceOptions): TemplateDoc[] {
  return options.catalog.entries
    .filter((entry): entry is TemplateDoc => entry.kind === 'template')
    .sort((left, right) => left.id.localeCompare(right.id));
}

function resolveVariables(template: TemplateDoc, supplied: Readonly<Record<string, string>> = {}): Readonly<Record<string, string>> {
  const definitions = new Map(template.variables.map((variable) => [variable.name, variable]));
  for (const name of Object.keys(supplied)) if (!definitions.has(name)) throw new Error(`Unknown variable for ${template.id}: ${name}`);
  const resolved: Record<string, string> = {};
  for (const definition of template.variables) {
    const value = supplied[definition.name] ?? definition.defaultValue;
    if (value === undefined) throw new Error(`Missing required variable for ${template.id}: ${definition.name}`);
    if (value.length > 80 || /[{}\0\r\n]/.test(value)) throw new Error(`Unsafe variable value for ${definition.name}.`);
    if (definition.name === 'componentPrefix' && value && !/^[A-Z][A-Za-z0-9]*$/.test(value)) {
      throw new Error('componentPrefix must be an empty string or PascalCase identifier prefix.');
    }
    resolved[definition.name] = value;
  }
  return resolved;
}

function substitute(input: string, variables: Readonly<Record<string, string>>, label: string): string {
  const names = new Set<string>();
  const output = input.replace(VARIABLE_PATTERN, (_match, name: string) => {
    names.add(name);
    if (!(name in variables)) throw new Error(`Unknown template placeholder ${name} in ${label}.`);
    return variables[name] ?? '';
  });
  return output;
}

interface PreparedFile {
  source: string;
  target: string;
  relativeTarget: string;
  role: string;
  content: string;
  digest: string;
  bytes: number;
}

async function prepareFiles(options: RegistryServiceOptions, template: TemplateDoc, projectRoot: string, targetDirectory: string, variables: Readonly<Record<string, string>>): Promise<PreparedFile[]> {
  const templateRoot = await realpath(resolve(options.templateRoot));
  const targetBase = resolve(projectRoot, targetDirectory);
  if (!isWithin(projectRoot, targetBase)) throw new Error('Target directory must stay inside the project root.');
  await assertNoSymlinkEscape(projectRoot, targetBase);
  const files: PreparedFile[] = [];
  const targets = new Set<string>();
  for (const file of template.files) {
    if (!file.source) throw new Error(`Template file is missing registry source: ${template.id} ${file.path}`);
    const sourceRelative = validateSource(file.source);
    const sourcePath = resolve(templateRoot, sourceRelative);
    const sourceReal = await realpath(sourcePath);
    if (!isWithin(templateRoot, sourceReal)) throw new Error(`Registry source escapes template root: ${file.source}`);
    const targetPathFragment = normalizeRelativePath(substitute(file.path, variables, `${template.id}:${file.path}`), 'Template target path', false);
    const target = resolve(targetBase, targetPathFragment);
    if (!isWithin(projectRoot, target)) throw new Error('Template target must stay inside the project root.');
    await assertNoSymlinkEscape(projectRoot, target);
    if (targets.has(target)) throw new Error(`Template produces duplicate target: ${relative(projectRoot, target)}`);
    targets.add(target);
    const content = substitute(await readFile(sourceReal, 'utf8'), variables, file.source);
    files.push({ source: file.source, target, relativeTarget: relative(projectRoot, target), role: file.role, content, digest: digest(content), bytes: Buffer.byteLength(content) });
  }
  return files.sort((left, right) => left.relativeTarget.localeCompare(right.relativeTarget));
}

async function filePlan(file: PreparedFile): Promise<ScaffoldFilePlan> {
  if (!(await exists(file.target))) return { source: file.source, target: file.target, relativeTarget: file.relativeTarget, role: file.role, status: 'create', expectedDigest: file.digest, bytes: file.bytes };
  const information = await lstat(file.target);
  if (information.isSymbolicLink() || !information.isFile()) return { source: file.source, target: file.target, relativeTarget: file.relativeTarget, role: file.role, status: 'conflict', expectedDigest: file.digest, bytes: file.bytes };
  const currentDigest = digest(await readFile(file.target, 'utf8'));
  return { source: file.source, target: file.target, relativeTarget: file.relativeTarget, role: file.role, status: currentDigest === file.digest ? 'unchanged' : 'conflict', expectedDigest: file.digest, currentDigest, bytes: file.bytes };
}

function summary(files: readonly ScaffoldFilePlan[]) {
  return {
    create: files.filter((file) => file.status === 'create').length,
    unchanged: files.filter((file) => file.status === 'unchanged').length,
    conflict: files.filter((file) => file.status === 'conflict').length,
  };
}

async function templateManifest(options: RegistryServiceOptions, template: TemplateDoc): Promise<RegistryTemplateManifest> {
  const templateRoot = await realpath(resolve(options.templateRoot));
  const files: RegistryFileManifest[] = [];
  for (const file of template.files) {
    if (!file.source) throw new Error(`Template file is missing registry source: ${template.id} ${file.path}`);
    const sourceRelative = validateSource(file.source);
    const source = await realpath(resolve(templateRoot, sourceRelative));
    if (!isWithin(templateRoot, source)) throw new Error(`Registry source escapes template root: ${file.source}`);
    const content = await readFile(source, 'utf8');
    files.push({ path: file.path, role: file.role, source: file.source, digest: digest(content), bytes: Buffer.byteLength(content) });
  }
  files.sort((left, right) => left.path.localeCompare(right.path));
  const templateDigest = digest(JSON.stringify({ id: template.id, version: template.version, files: files.map((file) => ({ path: file.path, digest: file.digest })) }));
  return { id: template.id, name: template.name, version: template.version, target: template.target, digest: templateDigest, files, variables: template.variables };
}

export function createRegistryService(options: RegistryServiceOptions): RegistryService {
  return {
    async manifest(): Promise<RegistryManifest> {
      const templates = await Promise.all(templateEntries(options).map((template) => templateManifest(options, template)));
      return { schemaVersion: 1, generatedAt: options.catalog.generatedAt, packageVersion: options.catalog.packageVersion, templates };
    },
    async scaffold(input: ScaffoldInput): Promise<ScaffoldResult> {
      const template = templateEntries(options).find((entry) => entry.id === input.templateId);
      if (!template) throw new Error(`Registry template not found: ${input.templateId}`);
      const projectRoot = await assertProjectRoot(input.projectRoot);
      const targetDirectory = normalizeRelativePath(input.targetDirectory ?? '.', 'targetDirectory');
      const mode = input.mode ?? 'dry-run';
      const variables = resolveVariables(template, input.variables);
      const prepared = await prepareFiles(options, template, projectRoot, targetDirectory, variables);
      const plans = await Promise.all(prepared.map(filePlan));
      const counts = summary(plans);
      if (mode === 'apply' && counts.conflict > 0) {
        throw new Error(`Scaffold conflicts with ${counts.conflict} existing file(s). No files were written.`);
      }
      if (mode === 'apply') {
        for (const file of prepared) {
          const plan = plans.find((candidate) => candidate.target === file.target);
          if (plan?.status !== 'create') continue;
          await mkdir(dirname(file.target), { recursive: true });
          await assertNoSymlinkEscape(projectRoot, dirname(file.target));
          await writeFile(file.target, file.content, { encoding: 'utf8', flag: 'wx' });
        }
      }
      return { schemaVersion: 1, templateId: template.id, templateVersion: template.version, projectRoot, targetDirectory, mode, applied: mode === 'apply', files: plans, summary: counts };
    },
  };
}


export function createBundledRegistryService(catalog: RegistryServiceOptions['catalog']): RegistryService {
  return createRegistryService({
    catalog,
    templateRoot: fileURLToPath(new URL('../templates/', import.meta.url)),
  });
}
