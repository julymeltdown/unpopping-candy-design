import assert from 'node:assert/strict';
import test from 'node:test';
import { bundledCatalog, getCatalogEntry, searchCatalog, validateCatalog } from '../src/index.ts';

test('bundled catalog contains every stable public surface', () => {
  const counts = Object.groupBy(bundledCatalog.entries, (entry) => entry.kind);
  assert.equal(counts.component?.length, 32);
  assert.equal(counts.pattern?.length, 6);
  assert.equal(counts.template?.length, 5);
  assert.equal(counts.migration?.length, 1);
  assert.deepEqual(validateCatalog(bundledCatalog), []);
});

test('bundled catalog exposes version-aware component guidance', () => {
  const button = getCatalogEntry(bundledCatalog, 'Button');
  assert.equal(button?.id, 'ui.button');
  assert.equal(button?.version, '0.1.0');
  assert.equal(button?.kind, 'component');
  if (button?.kind !== 'component') throw new Error('Button metadata must be a component.');
  assert.ok(button.entrypoints.includes('@commonspace/ui/button'));
  assert.ok(button.accessibility.requirements.length >= 2);
  assert.ok(button.stories.includes('catalog-ui--button'));
});

test('search returns product patterns as well as components', () => {
  const results = searchCatalog(bundledCatalog, 'social feed');
  assert.ok(results.some((result) => result.id === 'pattern.social-feed'));
  assert.ok(results.some((result) => result.id === 'social.timeline-view'));
});
