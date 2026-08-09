import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { extractModuleSpecifiers, listFiles, packageNameFromSpecifier } from '../../scripts/lib/project-inspection.mjs';

test('module inspection finds static, side-effect, export, and dynamic imports', () => {
  const source = `import React from 'react';\nimport '@unpopping-candy/ui/styles.css';\nexport { x } from './x.js';\nconst y = import('@unpopping-candy/social');`;
  assert.deepEqual(new Set(extractModuleSpecifiers(source)), new Set(['react', '@unpopping-candy/ui/styles.css', './x.js', '@unpopping-candy/social']));
});

test('package name extraction handles scoped subpaths', () => {
  assert.equal(packageNameFromSpecifier('@unpopping-candy/ui/button'), '@unpopping-candy/ui');
  assert.equal(packageNameFromSpecifier('react/jsx-runtime'), 'react');
});

test('repository inspection skips installed dependencies and build artifacts', async () => {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-inspection-'));
  try {
    await mkdir(join(root, 'node_modules', 'dependency'), { recursive: true });
    await mkdir(join(root, 'dist'), { recursive: true });
    await writeFile(join(root, 'package.json'), '{}');
    await writeFile(join(root, 'node_modules', 'dependency', 'package.json'), '{}');
    await writeFile(join(root, 'dist', 'package.json'), '{}');
    assert.deepEqual(await listFiles(root, (path) => path.endsWith('package.json')), [join(root, 'package.json')]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
