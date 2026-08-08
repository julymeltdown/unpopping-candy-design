import assert from 'node:assert/strict';
import test from 'node:test';
import { componentTokens, radii, referenceColors, space } from '../src/tokens.ts';

test('reference tokens expose stable semantic building blocks', () => {
  assert.equal(referenceColors.neutral0, '#ffffff');
  assert.equal(referenceColors.neutral950, '#161616');
  assert.equal(referenceColors.blue500, '#0f62fe');
});

test('spacing and component dimensions are ordered', () => {
  assert.equal(space[0], '0');
  assert.equal(space[4], '1rem');
  assert.equal(radii.round, '999px');
  assert.equal(componentTokens.button.heightMd, '2.5rem');
});
