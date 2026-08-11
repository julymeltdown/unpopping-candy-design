import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import {
  classifyPackageManifest,
  PRIVATE_TOOL_PACKAGE_NAMES,
  PUBLIC_PACKAGE_NAMES,
} from '../../scripts/lib/public-packages.mjs';

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

test('release configuration publishes exactly the coordinated public package set', async () => {
  const changesets = JSON.parse(await readFile(new URL('.changeset/config.json', root), 'utf8'));
  const changesetPackageNames = [];
  const changesetFiles = await readdir(new URL('.changeset/', root));

  for (const changesetFile of changesetFiles.filter((name) => name.endsWith('.md'))) {
    const contents = await readFile(new URL(`.changeset/${changesetFile}`, root), 'utf8');
    const frontmatter = contents.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatter) {
      for (const match of frontmatter[1].matchAll(/^"([^"]+)":\s+(major|minor|patch)$/gm)) {
        changesetPackageNames.push(match[1]);
      }
    }
  }

  assert.equal(PUBLIC_PACKAGE_NAMES.length, 9);
  assert.deepEqual(PRIVATE_TOOL_PACKAGE_NAMES, [
    '@unpopping-candy/evals',
    '@unpopping-candy/figma',
  ]);
  assert.equal(classifyPackageManifest({ name: '@unpopping-candy/evals' }), 'private-tool');
  assert.equal(classifyPackageManifest({ name: '@unpopping-candy/figma' }), 'private-tool');
  assert.deepEqual(changesets.fixed, [PUBLIC_PACKAGE_NAMES]);
  assert.deepEqual(
    changesetPackageNames.filter((name) => PRIVATE_TOOL_PACKAGE_NAMES.includes(name)),
    [],
  );
});
