import assert from 'node:assert/strict';
import test from 'node:test';
import { iconRegistry } from '../src/icon-registry.ts';

test('semantic icon names and Ant source names are unique', () => {
  const semanticNames = Object.keys(iconRegistry);
  const sourceNames = Object.values(iconRegistry);
  assert.equal(new Set(semanticNames).size, semanticNames.length);
  assert.equal(new Set(sourceNames).size, sourceNames.length);
  assert.ok(semanticNames.length >= 40);
});

test('semantic names do not leak Ant naming conventions', () => {
  for (const name of Object.keys(iconRegistry)) {
    assert.match(name, /Icon$/);
    assert.doesNotMatch(name, /(Outlined|Filled)$/);
  }
});
