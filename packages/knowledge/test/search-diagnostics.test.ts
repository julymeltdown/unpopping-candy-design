import assert from 'node:assert/strict';
import test from 'node:test';
import { bundledCatalog, createCatalog, searchCatalog, searchCatalogDetailed } from '../src/index.ts';
import { searchCatalog as searchCatalogFromSubpath } from '../src/catalog.ts';

test('detailed search reports deterministic counts when no entry supports the request', () => {
  // Given a real catalog and a query with no eligible entry
  // When detailed search runs
  const result = searchCatalogDetailed(bundledCatalog, 'quantum payroll spaceship');

  // Then machine-readable counts and an unsupported diagnostic explain the empty result
  assert.deepEqual(result.benchmark, {
    scanned: bundledCatalog.entries.length,
    eligible: 0,
    returned: 0,
    omittedDeprecated: 0,
    omittedIncompatible: 0,
  });
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 'POPCANDY_SEARCH_UNSUPPORTED'));
  assert.deepEqual(searchCatalogFromSubpath(bundledCatalog, 'quantum payroll spaceship'), result.results);
});

test('detailed search keeps deprecated matches visible with migration guidance', () => {
  // Given a catalog whose exact match is deprecated
  const button = bundledCatalog.entries.find((entry) => entry.id === 'ui.button');
  if (!button) throw new Error('Expected ui.button fixture.');
  const catalog = createCatalog([{ ...button, status: 'deprecated', deprecatedBy: 'ui.button-next' }, { ...button, id: 'ui.button-next', name: 'Button Next' }]);

  // When detailed search runs
  const result = searchCatalogDetailed(catalog, 'ui.button', { limit: 1 });

  // Then the deprecated entry remains returned and carries a diagnostic
  assert.equal(result.results[0]?.id, 'ui.button');
  assert.equal(result.benchmark.omittedDeprecated, 0);
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 'POPCANDY_SEARCH_DEPRECATED' && diagnostic.entryId === 'ui.button'));
  assert.deepEqual(searchCatalog(catalog, 'ui.button', { limit: 1 }), result.results);
});

test('detailed search diagnoses non-stable, incompatible, and truncated matches', () => {
  // Given status variants and a kind constraint that excludes a matching pattern
  const button = bundledCatalog.entries.find((entry) => entry.id === 'ui.button');
  const pattern = bundledCatalog.entries.find((entry) => entry.id === 'pattern.form-actions');
  if (!button || !pattern) throw new Error('Expected search fixtures.');
  const catalog = createCatalog([
    { ...button, id: 'ui.action-beta', name: 'Action', status: 'beta' },
    { ...button, id: 'ui.action-experimental', name: 'Action Lab', status: 'experimental' },
    { ...pattern, id: 'pattern.action', name: 'Action Pattern', keywords: ['action'] },
  ]);

  // When one compatible result is requested
  const result = searchCatalogDetailed(catalog, 'action', { kind: 'component', limit: 1 });

  // Then every omitted or non-stable class has a deterministic diagnostic
  assert.equal(result.benchmark.scanned, 3);
  assert.equal(result.benchmark.eligible, 2);
  assert.equal(result.benchmark.returned, 1);
  assert.equal(result.benchmark.omittedIncompatible, 1);
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 'POPCANDY_SEARCH_BETA'));
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 'POPCANDY_SEARCH_INCOMPATIBLE'));
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 'POPCANDY_SEARCH_TRUNCATED'));
});

test('detailed search diagnoses a returned experimental entry', () => {
  // Given an experimental exact match
  const button = bundledCatalog.entries.find((entry) => entry.id === 'ui.button');
  if (!button) throw new Error('Expected ui.button fixture.');
  const catalog = createCatalog([{ ...button, status: 'experimental' }]);

  // When detailed search returns it
  const result = searchCatalogDetailed(catalog, 'ui.button');

  // Then experimental adoption risk is machine-readable
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 'POPCANDY_SEARCH_EXPERIMENTAL'));
});
