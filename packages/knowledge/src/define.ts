import type { ComponentDoc, MigrationDoc, PatternDoc, TemplateDoc } from './types.ts';
const ID_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;
const PACKAGE_PATTERN = /^(?:@[a-z0-9-]+\/[a-z0-9-]+|[a-z0-9-]+)$/;
function assertBase(entry: { id: string; name: string; version: string; summary: string; keywords: readonly string[]; useWhen: readonly string[]; avoidWhen: readonly string[] }): void {
  if (!ID_PATTERN.test(entry.id)) throw new Error(`Invalid knowledge id: ${entry.id}`);
  if (!entry.name.trim()) throw new Error('Knowledge name must not be empty');
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(entry.version)) throw new Error(`Invalid version for ${entry.id}: ${entry.version}`);
  if (!entry.summary.trim()) throw new Error(`Summary is required for ${entry.id}`);
  if (!entry.keywords.length || !entry.useWhen.length || !entry.avoidWhen.length) throw new Error(`Guidance is incomplete for ${entry.id}`);
}
function assertSafeRelativePath(path: string, field: string): void {
  if (!path || path.startsWith('/') || path.includes('..') || path.includes('\\') || path.includes('\0')) throw new Error(`Invalid ${field}: ${path}`);
}
export function defineComponentDoc<const T extends ComponentDoc>(entry: T): T {
  assertBase(entry);
  if (!PACKAGE_PATTERN.test(entry.package)) throw new Error(`Invalid package for ${entry.id}`);
  assertSafeRelativePath(entry.sourcePath, 'sourcePath');
  if (!entry.entrypoints.length || entry.entrypoints.some((item) => !item.startsWith(entry.package))) throw new Error(`Invalid entrypoint for ${entry.id}`);
  if (new Set(entry.props.map((prop) => prop.name)).size !== entry.props.length) throw new Error(`Duplicate prop in ${entry.id}`);
  return Object.freeze(entry);
}
export function definePatternDoc<const T extends PatternDoc>(entry: T): T { assertBase(entry); if (!entry.components.length || !entry.anatomy.length) throw new Error(`Incomplete pattern ${entry.id}`); return Object.freeze(entry); }
export function defineTemplateDoc<const T extends TemplateDoc>(entry: T): T { assertBase(entry); if (!entry.description.trim() || !entry.files.length) throw new Error(`Incomplete template ${entry.id}`); entry.files.forEach((file) => assertSafeRelativePath(file.path, 'template file path')); return Object.freeze(entry); }
export function defineMigrationDoc<const T extends MigrationDoc>(entry: T): T { assertBase(entry); if (entry.fromVersion === entry.toVersion || !entry.changes.length) throw new Error(`Invalid migration ${entry.id}`); return Object.freeze(entry); }
