import type { CatalogIssue, ComponentDoc, KnowledgeCatalog, KnowledgeEntry, SearchResult } from './types.ts';
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
function trigrams(value: string): Set<string> { const input=`  ${normalize(value)}  `; const out=new Set<string>(); for(let i=0;i<input.length-2;i+=1) out.add(input.slice(i,i+3)); return out; }
function similarity(a:string,b:string):number { const x=trigrams(a), y=trigrams(b); let hit=0; for(const v of x) if(y.has(v)) hit+=1; const d=x.size+y.size-hit; return d ? hit/d : 0; }
export function searchCatalog(catalog: KnowledgeCatalog, query: string, options: { kind?: KnowledgeEntry['kind']; limit?: number } = {}): SearchResult[] {
  const needle=normalize(query); if(!needle) return []; const words=needle.split(/\s+/); const results:SearchResult[]=[];
  for(const entry of catalog.entries) { if(options.kind && entry.kind!==options.kind) continue; let score=0; const reasons:string[]=[]; const name=normalize(entry.name), id=normalize(entry.id), summary=normalize(entry.summary), keywords=entry.keywords.map(normalize);
    if(name===needle || id===needle){score+=100;reasons.push('exact-name');}
    if(name.includes(needle)||id.includes(needle)){score+=50;reasons.push('name-contains-query');}
    for(const word of words){if(keywords.includes(word)){score+=20;reasons.push(`keyword:${word}`);} if(summary.includes(word)) score+=5;}
    score += Math.round(similarity(`${entry.name} ${entry.id} ${entry.keywords.join(' ')}`, needle)*30);
    if(score>0) results.push({id:entry.id,kind:entry.kind,name:entry.name,summary:entry.summary,score,reasons});
  }
  return results.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).slice(0,Math.max(1,Math.min(options.limit??20,100)));
}
export function getCatalogEntry(catalog: KnowledgeCatalog, idOrName: string): KnowledgeEntry | undefined { const needle=normalize(idOrName); return catalog.entries.find((entry)=>normalize(entry.id)===needle||normalize(entry.name)===needle); }
