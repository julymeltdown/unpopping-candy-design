import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectCssContract } from '../../scripts/lib/css-contract.mjs';

test('class modifiers are not mistaken for custom-property declarations', () => {
  const errors = inspectCssContract(`
    .popcandy-button--primary { color: var(--popcandy-color-action-primary); }
    .popcandy-post-card--skeleton::before { content: ''; }
  `, 'fixture.css');

  assert.deepEqual(errors, []);
});

test('non-namespaced classes and custom properties are rejected', () => {
  const errors = inspectCssContract(`
    :root { --brand-color: red; }
    .button { color: var(--brand-color); }
  `, 'fixture.css');

  assert.deepEqual(errors, [
    'fixture.css: custom property --brand-color must use --popcandy- prefix',
    'fixture.css: class .button must use popcandy- or is- namespace',
  ]);
});
