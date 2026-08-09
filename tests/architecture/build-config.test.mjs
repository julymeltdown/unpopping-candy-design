import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../..', import.meta.url);

test('TypeScript build rewrites source .ts imports to runnable .js imports', async () => {
  const config = JSON.parse(await readFile(new URL('tsconfig.base.json', root), 'utf8'));
  assert.equal(config.compilerOptions.allowImportingTsExtensions, true);
  assert.equal(config.compilerOptions.rewriteRelativeImportExtensions, true);
});
