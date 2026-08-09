import type { ComponentDoc, KnowledgeCatalog, KnowledgeEntry } from '@commonspace/knowledge';
import type { CompositionPlan } from './types.ts';

function uniqueById(entries: readonly KnowledgeEntry[]): KnowledgeEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => !seen.has(entry.id) && seen.add(entry.id));
}

function componentImports(entries: readonly KnowledgeEntry[]): string[] {
  return [...new Set(entries.flatMap((entry) => entry.kind === 'component' ? entry.entrypoints.slice(0, 1) : []))].sort();
}

export function composeInterfacePlan(
  catalog: KnowledgeCatalog,
  request: string,
  search: (query: string, options?: { kind?: KnowledgeEntry['kind']; limit?: number }) => readonly { id: string }[],
): CompositionPlan {
  const normalized = request.trim();
  if (!normalized) throw new Error('Composition request must not be empty.');
  const templateResult = search(normalized, { kind: 'template', limit: 1 });
  const patternResults = search(normalized, { kind: 'pattern', limit: 4 });
  const componentResults = search(normalized, { kind: 'component', limit: 10 });
  const resolve = (id: string) => catalog.entries.find((entry) => entry.id === id);
  const template = templateResult[0] ? resolve(templateResult[0].id) ?? null : null;
  const patterns = uniqueById(patternResults.map((result) => resolve(result.id)).filter((entry): entry is KnowledgeEntry => Boolean(entry)));
  const requiredComponentIds = [
    ...(template?.kind === 'template' ? template.components : []),
    ...patterns.flatMap((pattern) => pattern.kind === 'pattern' ? pattern.components : []),
  ];
  const searchedComponents = componentResults.map((result) => resolve(result.id)).filter((entry): entry is ComponentDoc => entry?.kind === 'component');
  const components = uniqueById([
    ...requiredComponentIds.map(resolve).filter((entry): entry is ComponentDoc => entry?.kind === 'component'),
    ...searchedComponents,
  ]).slice(0, 14);
  const references = [template?.id, ...patterns.map((entry) => entry.id), ...components.map((entry) => entry.id)].filter((id): id is string => Boolean(id));
  return {
    request: normalized,
    catalogVersion: catalog.packageVersion,
    template,
    patterns,
    components,
    imports: componentImports(components),
    steps: [
      { phase: 'detect', action: 'Confirm framework, installed Commonspace versions, theme, and source paths.', references: [] },
      { phase: 'frame', action: template ? `Use ${template.name} as the nearest complete frame.` : 'Compose a page frame from Container, Stack, and the nearest product pattern.', references: template ? [template.id] : ['ui.container', 'ui.stack'] },
      { phase: 'compose', action: 'Implement the selected patterns with public component entrypoints and consumer-owned state.', references },
      { phase: 'states', action: 'Add loading, empty, populated, error, disabled, pending, responsive, dark, and high-contrast states where applicable.', references: patterns.map((entry) => entry.id) },
      { phase: 'verify', action: 'Generate a Storybook story, run Commonspace validation, then run interaction and accessibility checks.', references: components.flatMap((entry) => entry.kind === 'component' ? entry.stories : []) },
    ],
    validation: [
      'No @commonspace/*/src imports.',
      'No invented component names or props.',
      'No hardcoded design-system colors, spacing, radius, shadows, or motion.',
      'No data fetching, routing, authentication, or remote-state ownership inside visual components.',
      'Keyboard, focus, accessible names, responsive reflow, loading, empty, and failure states are covered.',
    ],
  };
}
