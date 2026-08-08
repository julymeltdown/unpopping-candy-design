import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeClassNames } from '../src/lib/merge-class-names.ts';

test('mergeClassNames drops empty and false values while preserving order', () => {
  assert.equal(mergeClassNames('base', false, undefined, 'active', null), 'base active');
});
