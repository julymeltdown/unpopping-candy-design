import assert from 'node:assert/strict';
import test from 'node:test';
import { extractModuleSpecifiers, packageNameFromSpecifier } from '../../scripts/lib/project-inspection.mjs';

test('module inspection finds static, side-effect, export, and dynamic imports', () => {
  const source = `import React from 'react';\nimport '@commonspace/ui/styles.css';\nexport { x } from './x.js';\nconst y = import('@commonspace/social');`;
  assert.deepEqual(new Set(extractModuleSpecifiers(source)), new Set(['react', '@commonspace/ui/styles.css', './x.js', '@commonspace/social']));
});

test('package name extraction handles scoped subpaths', () => {
  assert.equal(packageNameFromSpecifier('@commonspace/ui/button'), '@commonspace/ui');
  assert.equal(packageNameFromSpecifier('react/jsx-runtime'), 'react');
});
