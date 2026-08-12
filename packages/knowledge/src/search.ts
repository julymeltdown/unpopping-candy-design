import type { KnowledgeCatalog, KnowledgeEntry, SearchResult } from './types.ts';

export type SearchDiagnosticCode =
  | 'POPCANDY_SEARCH_BETA'
  | 'POPCANDY_SEARCH_EXPERIMENTAL'
  | 'POPCANDY_SEARCH_DEPRECATED'
  | 'POPCANDY_SEARCH_UNSUPPORTED'
  | 'POPCANDY_SEARCH_TRUNCATED'
  | 'POPCANDY_SEARCH_INCOMPATIBLE';

export interface SearchDiagnostic {
  readonly code: SearchDiagnosticCode;
  readonly entryId?: string;
  readonly count?: number;
  readonly guidance: string;
}

export interface SearchBenchmark {
  readonly scanned: number;
  readonly eligible: number;
  readonly returned: number;
  readonly omittedDeprecated: number;
  readonly omittedIncompatible: number;
}

export interface DetailedSearchResult {
  readonly results: readonly SearchResult[];
  readonly benchmark: SearchBenchmark;
  readonly diagnostics: readonly SearchDiagnostic[];
}

export interface SearchOptions {
  readonly kind?: KnowledgeEntry['kind'];
  readonly limit?: number;
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function trigrams(value: string): Set<string> {
  const input = `  ${normalize(value)}  `;
  const output = new Set<string>();
  for (let index = 0; index < input.length - 2; index += 1) output.add(input.slice(index, index + 3));
  return output;
}

function similarity(left: string, right: string): number {
  const leftParts = trigrams(left);
  const rightParts = trigrams(right);
  let intersection = 0;
  for (const part of leftParts) if (rightParts.has(part)) intersection += 1;
  const union = leftParts.size + rightParts.size - intersection;
  return union ? intersection / union : 0;
}

function rank(entry: KnowledgeEntry, needle: string, words: readonly string[]): SearchResult | undefined {
  let score = 0;
  const reasons: string[] = [];
  const name = normalize(entry.name);
  const id = normalize(entry.id);
  const summary = normalize(entry.summary);
  const keywords = entry.keywords.map(normalize);
  if (name === needle || id === needle) { score += 100; reasons.push('exact-name'); }
  if (name.includes(needle) || id.includes(needle)) { score += 50; reasons.push('name-contains-query'); }
  for (const word of words) {
    if (keywords.includes(word)) { score += 20; reasons.push(`keyword:${word}`); }
    if (summary.includes(word)) score += 5;
  }
  score += Math.round(similarity(`${entry.name} ${entry.id} ${entry.keywords.join(' ')}`, needle) * 30);
  return score >= 5 ? { id: entry.id, kind: entry.kind, name: entry.name, summary: entry.summary, score, reasons } : undefined;
}

function statusDiagnostic(entry: KnowledgeEntry): SearchDiagnostic | undefined {
  switch (entry.status) {
    case 'stable': return undefined;
    case 'beta': return { code: 'POPCANDY_SEARCH_BETA', entryId: entry.id, guidance: 'Confirm beta API stability before adoption.' };
    case 'experimental': return { code: 'POPCANDY_SEARCH_EXPERIMENTAL', entryId: entry.id, guidance: 'Use experimental entries only with explicit risk acceptance.' };
    case 'deprecated': return { code: 'POPCANDY_SEARCH_DEPRECATED', entryId: entry.id, guidance: entry.deprecatedBy ? `Migrate to ${entry.deprecatedBy}.` : 'Inspect migration guidance before use.' };
  }
}

export function searchCatalogDetailed(catalog: KnowledgeCatalog, query: string, options: SearchOptions = {}): DetailedSearchResult {
  const needle = normalize(query);
  const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
  const diagnostics: SearchDiagnostic[] = [];
  const ranked: SearchResult[] = [];
  let omittedIncompatible = 0;
  if (needle) {
    const words = needle.split(/\s+/);
    for (const entry of catalog.entries) {
      const result = rank(entry, needle, words);
      if (!result) continue;
      if (options.kind && entry.kind !== options.kind) { omittedIncompatible += 1; continue; }
      ranked.push(result);
    }
  }
  ranked.sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
  const results = ranked.slice(0, limit);
  for (const result of results) {
    const entry = catalog.entries.find((candidate) => candidate.id === result.id);
    if (!entry) continue;
    const diagnostic = statusDiagnostic(entry);
    if (diagnostic) diagnostics.push(diagnostic);
  }
  if (omittedIncompatible > 0) diagnostics.push({ code: 'POPCANDY_SEARCH_INCOMPATIBLE', count: omittedIncompatible, guidance: 'Matching entries outside the requested kind were omitted.' });
  if (ranked.length > results.length) diagnostics.push({ code: 'POPCANDY_SEARCH_TRUNCATED', count: ranked.length - results.length, guidance: 'Increase the result limit or narrow the query.' });
  if (results.length === 0) diagnostics.push({ code: 'POPCANDY_SEARCH_UNSUPPORTED', guidance: 'No compatible catalog entry supports this request.' });
  return {
    results,
    benchmark: { scanned: catalog.entries.length, eligible: ranked.length, returned: results.length, omittedDeprecated: 0, omittedIncompatible },
    diagnostics,
  };
}

export function searchCatalog(catalog: KnowledgeCatalog, query: string, options: SearchOptions = {}): readonly SearchResult[] {
  return searchCatalogDetailed(catalog, query, options).results;
}
