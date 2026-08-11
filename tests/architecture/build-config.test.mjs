import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../..', import.meta.url);

test('TypeScript build rewrites source .ts imports to runnable .js imports', async () => {
  const config = JSON.parse(await readFile(new URL('tsconfig.base.json', root), 'utf8'));
  assert.equal(config.compilerOptions.allowImportingTsExtensions, true);
  assert.equal(config.compilerOptions.rewriteRelativeImportExtensions, true);
});

test('CI installs an immutable pnpm 11.4.0 workspace', async () => {
  const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  const ci = await readFile(new URL('.github/workflows/ci.yml', root), 'utf8');

  assert.equal(packageJson.packageManager, 'pnpm@11.4.0');
  assert.match(ci, /pnpm install --frozen-lockfile/);
  assert.doesNotMatch(ci, /--no-frozen-lockfile/);
});
