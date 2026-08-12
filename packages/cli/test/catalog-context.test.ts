import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { bundledCatalog } from '../../knowledge/src/index.ts';
import type { KnowledgeEntry } from '../../knowledge/src/index.ts';
import { resolveCatalogContext } from '../src/catalog-context.ts';

function entry(kind: KnowledgeEntry['kind']): KnowledgeEntry {
  const match = bundledCatalog.entries.find((candidate) => candidate.kind === kind);
  if (!match) throw new Error(`Missing ${kind} catalog fixture.`);
  return match;
}

function catalogReplacing(id: string, replacement: unknown): unknown {
  return { ...bundledCatalog, entries: bundledCatalog.entries.map((candidate) => candidate.id === id ? replacement : candidate) };
}

async function configuredRoot(catalog: unknown): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-catalog-schema-'));
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'fixture' }));
  await writeFile(join(root, 'catalog.json'), JSON.stringify(catalog));
  await writeFile(join(root, 'popcandy.config.json'), JSON.stringify({ schemaVersion: 1, catalog: './catalog.json' }));
  return root;
}

test('configured catalogs reject every malformed nested record shape before use', async () => {
  // Given representative malformed elements for every nested and optional record shape
  const component = entry('component');
  const pattern = entry('pattern');
  const template = entry('template');
  const migration = entry('migration');
  const cases: readonly { readonly label: string; readonly id: string; readonly replacement: unknown }[] = [
    { label: 'accessibility keyboard', id: component.id, replacement: { ...component, accessibility: { ...component.accessibility, keyboard: [null] } } },
    { label: 'accessibility semantics', id: component.id, replacement: { ...component, accessibility: { ...component.accessibility, semantics: [null] } } },
    { label: 'preferred example', id: component.id, replacement: { ...component, examples: { ...component.examples, preferred: [null] } } },
    { label: 'example optional reason', id: component.id, replacement: { ...component, examples: { ...component.examples, avoid: [{ title: 'x', code: 'x', reason: 1 }] } } },
    { label: 'tags', id: component.id, replacement: { ...component, tags: [null] } },
    { label: 'deprecatedBy', id: component.id, replacement: { ...component, deprecatedBy: 1 } },
    { label: 'component prop', id: component.id, replacement: { ...component, props: [null] } },
    { label: 'prop optional default', id: component.id, replacement: { ...component, props: [{ name: 'x', type: 'string', required: false, defaultValue: 1 }] } },
    { label: 'prop optional description', id: component.id, replacement: { ...component, props: [{ name: 'x', type: 'string', required: false, description: 1 }] } },
    { label: 'component variant', id: component.id, replacement: { ...component, variants: [null] } },
    { label: 'component composition', id: component.id, replacement: { ...component, composition: { children: [null] } } },
    { label: 'component state attributes', id: component.id, replacement: { ...component, stateAttributes: { disabled: 1 } } },
    { label: 'component figma', id: component.id, replacement: { ...component, figma: { propertyMap: { size: 1 } } } },
    { label: 'figma optional node url', id: component.id, replacement: { ...component, figma: { nodeUrl: 1 } } },
    { label: 'component native element', id: component.id, replacement: { ...component, nativeElement: 1 } },
    { label: 'pattern flow', id: pattern.id, replacement: { ...pattern, flow: [null] } },
    { label: 'pattern stories', id: pattern.id, replacement: { ...pattern, stories: [null] } },
    { label: 'template file', id: template.id, replacement: { ...template, files: [null] } },
    { label: 'template file optional source', id: template.id, replacement: { ...template, files: [{ path: 'x', role: 'x', source: 1 }] } },
    { label: 'template variable', id: template.id, replacement: { ...template, variables: [null] } },
    { label: 'template variable optional default', id: template.id, replacement: { ...template, variables: [{ name: 'x', description: 'x', defaultValue: 1 }] } },
    { label: 'migration change', id: migration.id, replacement: { ...migration, changes: [null] } },
    { label: 'migration change optional target', id: migration.id, replacement: { ...migration, changes: [{ kind: 'remove', from: 'x', to: 1, guidance: 'x' }] } },
  ];

  // When each configured catalog crosses the file boundary
  const results = await Promise.all(cases.map(async (fixture) => {
    const root = await configuredRoot(catalogReplacing(fixture.id, fixture.replacement));
    try {
      await resolveCatalogContext(root);
      return `${fixture.label}:accepted`;
    } catch (error) {
      return error instanceof Error && 'code' in error ? `${fixture.label}:${String(error.code)}` : `${fixture.label}:untyped`;
    }
  }));

  // Then every malformed shape fails with the catalog compatibility code
  assert.deepEqual(results, cases.map((fixture) => `${fixture.label}:POPCANDY_CATALOG_INCOMPATIBLE`));
});
