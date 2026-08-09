/// <reference types="node" />

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createThemeBootstrapScript,
  parseStoredThemeState,
  sanitizeThemeState,
  themeDataAttributes,
} from '../src/theme-state.ts';

test('theme state rejects unknown persisted values', () => {
  assert.deepEqual(
    sanitizeThemeState({ theme: 'nope', density: 'compact', accent: 'violet' }),
    { theme: 'system', density: 'compact', accent: 'violet' },
  );
  assert.deepEqual(parseStoredThemeState('{broken'), {
    theme: 'system',
    density: 'comfortable',
    accent: 'blue',
  });
});

test('theme attributes use the public data contract', () => {
  assert.deepEqual(
    themeDataAttributes({ theme: 'dark', density: 'compact', accent: 'neutral' }),
    {
      'data-popcandy-theme': 'dark',
      'data-popcandy-density': 'compact',
      'data-popcandy-accent': 'neutral',
    },
  );
});

test('bootstrap script does not interpolate an unsafe raw key', () => {
  const script = createThemeBootstrapScript('theme";</script>');
  assert.match(script, /localStorage\.getItem/);
  assert.match(script, /dataset\.popcandyTheme/);
  assert.doesNotMatch(script, /dataset\.cs(?:Theme|Density|Accent)/);
  assert.doesNotMatch(script, /key=theme"/);
});
