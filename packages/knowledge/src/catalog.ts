import type { CatalogIssue, ComponentDoc, KnowledgeCatalog, KnowledgeEntry } from './types.ts';
export { searchCatalog } from './search.ts';
export type { SearchOptions } from './search.ts';
export interface CreateCatalogOptions { generatedAt?: string; packageVersion?: string; }
export function createCatalog(entries: readonly KnowledgeEntry[], options: CreateCatalogOptions = {}): KnowledgeCatalog {
  return { schemaVersion: 1, generatedAt: options.generatedAt ?? '1970-01-01T00:00:00.000Z', packageVersion: options.packageVersion ?? '0.2.0', entries: [...entries].sort((a,b) => a.id.localeCompare(b.id)) };
}
export function validateCatalog(catalog: KnowledgeCatalog): CatalogIssue[] {
  const issues: CatalogIssue[] = []; const counts = new Map<string, number>();
  for (const entry of catalog.entries) counts.set(entry.id, (counts.get(entry.id) ?? 0) + 1);
  for (const [id,count] of counts) if (count > 1) issues.push({ code:'duplicate-id', severity:'error', entryId:id, message:`Duplicate id: ${id}` });
  const all = new Set(catalog.entries.map((entry) => entry.id));
  const components = new Set(catalog.entries.filter((entry): entry is ComponentDoc => entry.kind === 'component').map((entry) => entry.id));
  for (const entry of catalog.entries) {
    if (entry.kind === 'component') for (const related of entry.related) if (!all.has(related)) issues.push({ code:'unknown-related', severity:'error', entryId:entry.id, message:`Unknown related entry ${related}` });
    if (entry.kind === 'pattern' || entry.kind === 'template') for (const component of entry.components) if (!components.has(component)) issues.push({ code:'unknown-component', severity:'error', entryId:entry.id, message:`Unknown component ${component}` });
    if (entry.kind === 'template') for (const pattern of entry.patterns) if (!all.has(pattern)) issues.push({ code:'unknown-pattern', severity:'error', entryId:entry.id, message:`Unknown pattern ${pattern}` });
    if (entry.deprecatedBy && !all.has(entry.deprecatedBy)) issues.push({ code:'unknown-replacement', severity:'error', entryId:entry.id, message:`Unknown deprecatedBy target ${entry.deprecatedBy}` });
  }
  return issues;
}
function normalize(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(); }
export function getCatalogEntry(catalog: KnowledgeCatalog, idOrName: string): KnowledgeEntry | undefined { const needle=normalize(idOrName); return catalog.entries.find((entry)=>normalize(entry.id)===needle||normalize(entry.name)===needle); }
