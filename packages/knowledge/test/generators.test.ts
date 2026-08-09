import assert from 'node:assert/strict';
import test from 'node:test';
import { bundledCatalog, generateAgentDocumentSet, generateComponentMarkdown, generateDesignMarkdown } from '../src/index.ts';
import tokens from '../../tokens/src/tokens.json' with { type: 'json' };

test('design document is generated from the catalog and machine-readable tokens', () => {
  const output = generateDesignMarkdown(bundledCatalog, tokens);
  assert.match(output, /^---\nschema:/);
  assert.match(output, /stableComponents: 32/);
  assert.match(output, /## Agent operating contract/);
  assert.match(output, /\[Button\]\(\.\/agent\/components\/ui\.button\.md\)/);
});

test('component document includes operational and accessibility guidance', () => {
  const button = bundledCatalog.entries.find((entry) => entry.id === 'ui.button');
  if (!button || button.kind !== 'component') throw new Error('Missing Button metadata.');
  const output = generateComponentMarkdown(button);
  assert.match(output, /## Use when/);
  assert.match(output, /## Avoid when/);
  assert.match(output, /## Accessibility/);
  assert.match(output, /catalog-ui-button--contract/);
});

test('agent document set is deterministic and has unique paths', () => {
  const first = generateAgentDocumentSet(bundledCatalog, tokens);
  const second = generateAgentDocumentSet(bundledCatalog, tokens);
  assert.deepEqual(first, second);
  assert.equal(new Set(first.map((file) => file.path)).size, first.length);
  assert.equal(first.filter((file) => file.path.startsWith('agent/components/')).length, 32);
});
