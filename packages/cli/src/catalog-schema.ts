import { validateCatalog } from '@unpopping-candy/knowledge';
import type { KnowledgeCatalog, KnowledgeEntry } from '@unpopping-candy/knowledge';
import { PopcandyProjectError } from './project-errors.ts';

type RecordValue = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStrings(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}

function isOptionalStrings(value: unknown): boolean {
  return value === undefined || isStrings(value);
}

function isStringRecord(value: unknown): boolean {
  return isRecord(value) && Object.values(value).every((item) => typeof item === 'string');
}

function isExample(value: unknown): boolean {
  return isRecord(value) && typeof value.title === 'string' && typeof value.code === 'string' && isOptionalString(value.reason);
}

function isBase(value: RecordValue): boolean {
  const accessibility = value.accessibility;
  const examples = value.examples;
  return value.schemaVersion === 1 && typeof value.id === 'string' && typeof value.name === 'string' &&
    typeof value.version === 'string' && typeof value.summary === 'string' &&
    (value.status === 'stable' || value.status === 'beta' || value.status === 'experimental' || value.status === 'deprecated') &&
    isStrings(value.keywords) && isStrings(value.useWhen) && isStrings(value.avoidWhen) &&
    isRecord(accessibility) && isStrings(accessibility.requirements) &&
    isOptionalStrings(accessibility.keyboard) && isOptionalStrings(accessibility.semantics) &&
    isRecord(examples) && Array.isArray(examples.preferred) && examples.preferred.every(isExample) &&
    Array.isArray(examples.avoid) && examples.avoid.every(isExample) &&
    isOptionalStrings(value.tags) && isOptionalString(value.deprecatedBy);
}

function isProp(value: unknown): boolean {
  return isRecord(value) && typeof value.name === 'string' && typeof value.type === 'string' &&
    typeof value.required === 'boolean' && isOptionalString(value.defaultValue) && isOptionalString(value.description);
}

function isVariant(value: unknown): boolean {
  return isRecord(value) && typeof value.name === 'string' && typeof value.guidance === 'string';
}

function isComposition(value: unknown): boolean {
  return value === undefined || (isRecord(value) && isOptionalStrings(value.parents) && isOptionalStrings(value.children));
}

function isFigma(value: unknown): boolean {
  return value === undefined || (isRecord(value) && isOptionalString(value.componentKey) &&
    isOptionalString(value.nodeUrl) && (value.propertyMap === undefined || isStringRecord(value.propertyMap)));
}

function isComponent(value: RecordValue): boolean {
  return typeof value.package === 'string' && typeof value.category === 'string' && typeof value.sourcePath === 'string' &&
    isStrings(value.entrypoints) && isStrings(value.tokens) && isStrings(value.related) && isStrings(value.stories) &&
    Array.isArray(value.props) && value.props.every(isProp) && Array.isArray(value.variants) && value.variants.every(isVariant) &&
    isStrings(value.states) && isComposition(value.composition) &&
    (value.stateAttributes === undefined || isStringRecord(value.stateAttributes)) &&
    isOptionalString(value.nativeElement) && isFigma(value.figma);
}

function isPattern(value: RecordValue): boolean {
  return isStrings(value.components) && isStrings(value.anatomy) && isStrings(value.states) &&
    isStrings(value.responsive) && isOptionalStrings(value.flow) && isOptionalStrings(value.stories);
}

function isTemplateFile(value: unknown): boolean {
  return isRecord(value) && typeof value.path === 'string' && typeof value.role === 'string' &&
    isOptionalString(value.content) && isOptionalString(value.source);
}

function isTemplateVariable(value: unknown): boolean {
  return isRecord(value) && typeof value.name === 'string' && typeof value.description === 'string' &&
    isOptionalString(value.defaultValue);
}

function isTemplate(value: RecordValue): boolean {
  return typeof value.description === 'string' && isStrings(value.components) && isStrings(value.patterns) &&
    Array.isArray(value.files) && value.files.every(isTemplateFile) &&
    Array.isArray(value.variables) && value.variables.every(isTemplateVariable) &&
    (value.target === 'react-vite' || value.target === 'react-vite-fsd' || value.target === 'agnostic');
}

function isMigrationChange(value: unknown): boolean {
  return isRecord(value) && (value.kind === 'rename' || value.kind === 'remove' || value.kind === 'replace' || value.kind === 'manual') &&
    typeof value.from === 'string' && isOptionalString(value.to) && typeof value.guidance === 'string';
}

function isEntry(value: unknown): value is KnowledgeEntry {
  if (!isRecord(value) || !isBase(value)) return false;
  if (value.kind === 'component') return isComponent(value);
  if (value.kind === 'pattern') return isPattern(value);
  if (value.kind === 'template') return isTemplate(value);
  return value.kind === 'migration' && typeof value.fromVersion === 'string' && typeof value.toVersion === 'string' &&
    Array.isArray(value.changes) && value.changes.every(isMigrationChange);
}

export function parseKnowledgeCatalog(value: unknown, path: string): KnowledgeCatalog {
  if (!isRecord(value) || value.schemaVersion !== 1 || typeof value.generatedAt !== 'string' ||
    typeof value.packageVersion !== 'string' || !Array.isArray(value.entries) || !value.entries.every(isEntry)) {
    throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `Catalog at ${path} does not match schemaVersion 1.`);
  }
  const catalog: KnowledgeCatalog = {
    schemaVersion: value.schemaVersion,
    generatedAt: value.generatedAt,
    packageVersion: value.packageVersion,
    entries: value.entries,
  };
  const error = validateCatalog(catalog).find((issue) => issue.severity === 'error');
  if (error) throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `Catalog at ${path} is invalid: ${error.message}`);
  return catalog;
}
