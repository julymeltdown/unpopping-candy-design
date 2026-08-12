import assert from 'node:assert/strict';
import { mkdir, mkdtemp, realpath, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  resolveInstalledPopcandyVersions,
} from '../src/version-resolution.ts';
import { PopcandyProjectError } from '../src/project-errors.ts';

const ui = '@unpopping-candy/ui';
const tokens = '@unpopping-candy/tokens';

async function project(dependencies: Record<string, string> = {}): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-version-resolution-'));
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'fixture', dependencies }));
  return root;
}

async function installedPackage(root: string, packageName: string, version: string, esmOnly = false): Promise<void> {
  const packageDirectory = join(root, 'packages', packageName.replace('@unpopping-candy/', ''));
  const linkDirectory = join(root, 'node_modules', '@unpopping-candy');
  await mkdir(packageDirectory, { recursive: true });
  await mkdir(linkDirectory, { recursive: true });
  await writeFile(join(packageDirectory, 'package.json'), JSON.stringify(esmOnly
    ? { name: packageName, version, type: 'module', exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } } }
    : { name: packageName, version }));
  await writeFile(join(packageDirectory, 'index.js'), 'export {};\n');
  await symlink(packageDirectory, join(linkDirectory, packageName.replace('@unpopping-candy/', '')));
}

async function expectError(
  promise: Promise<unknown>,
  code: PopcandyProjectError['code'],
): Promise<void> {
  await assert.rejects(promise, (error: unknown) => error instanceof PopcandyProjectError && error.code === code);
}

test('resolves exact versions from symlinked package manifests', async () => {
  // Given
  const root = await project({ [ui]: '^0.1.0', [tokens]: '^0.1.0' });
  await installedPackage(root, ui, '0.1.4');
  await installedPackage(root, tokens, '0.1.2');

  // When
  const result = await resolveInstalledPopcandyVersions(root, [ui, tokens]);

  // Then
  assert.deepEqual(result, {
    versions: { [tokens]: '0.1.2', [ui]: '0.1.4' },
    source: 'manifest',
    evidencePaths: [
      await realpath(join(root, 'packages', 'tokens', 'package.json')),
      await realpath(join(root, 'packages', 'ui', 'package.json')),
    ],
  });
});

test('resolves ESM-only symlinked package manifests after CommonJS resolution rejects exports', async () => {
  // Given
  const root = await project({ [ui]: '^0.1.0' });
  await installedPackage(root, ui, '0.1.4', true);

  // When
  const result = await resolveInstalledPopcandyVersions(root, [ui]);

  // Then
  assert.deepEqual(result, {
    versions: { [ui]: '0.1.4' },
    source: 'manifest',
    evidencePaths: [await realpath(join(root, 'packages', 'ui', 'package.json'))],
  });
});

test('resolves all declared packages from an npm lockfile v3', async () => {
  // Given
  const root = await project({ [ui]: '^0.1.0', [tokens]: '^0.1.0' });
  await writeFile(join(root, 'package-lock.json'), JSON.stringify({
    lockfileVersion: 3,
    packages: {
      'node_modules/@unpopping-candy/tokens': { version: '0.1.2' },
      'node_modules/@unpopping-candy/ui': { version: '0.1.4' },
    },
  }));

  // When
  const result = await resolveInstalledPopcandyVersions(root, [ui, tokens]);

  // Then
  assert.deepEqual(result, {
    versions: { [tokens]: '0.1.2', [ui]: '0.1.4' },
    source: 'npm-lock-v3',
    evidencePaths: [join(root, 'package-lock.json')],
  });
});

test('resolves exact versions from a pnpm lockfile v9', async () => {
  // Given
  const root = await project({ [ui]: '^0.1.0', [tokens]: '^0.1.0' });
  await writeFile(join(root, 'pnpm-lock.yaml'), [
    "lockfileVersion: '9.0'",
    'importers:',
    '  .:',
    '    dependencies:',
    '      "@unpopping-candy/tokens":',
    '        specifier: ^0.1.0',
    '        version: 0.1.2',
    '      "@unpopping-candy/ui":',
    '        specifier: ^0.1.0',
    '        version: 0.1.4',
  ].join('\n'));

  // When
  const result = await resolveInstalledPopcandyVersions(root, [ui, tokens]);

  // Then
  assert.deepEqual(result, {
    versions: { [tokens]: '0.1.2', [ui]: '0.1.4' },
    source: 'pnpm-lock-v9',
    evidencePaths: [join(root, 'pnpm-lock.yaml')],
  });
});

test('strips pnpm v9 peer suffixes from exact snapshots', async () => {
  // Given
  const root = await project({ [ui]: '^0.1.0' });
  await writeFile(join(root, 'pnpm-lock.yaml'), [
    "lockfileVersion: '9.0'",
    'importers:',
    '  .:',
    '    dependencies:',
    '      "@unpopping-candy/ui":',
    '        version: 0.1.4(react@19.2.8)',
  ].join('\n'));

  // When
  const result = await resolveInstalledPopcandyVersions(root, [ui]);

  // Then
  assert.deepEqual(result.versions, { [ui]: '0.1.4' });
});

test('uses materialized Yarn Berry node modules before a Yarn lockfile', async () => {
  // Given
  const root = await project({ [ui]: '^0.1.0' });
  await installedPackage(root, ui, '0.1.4');
  await writeFile(join(root, 'yarn.lock'), '__metadata:\n  version: 8\n');

  // When
  const result = await resolveInstalledPopcandyVersions(root, [ui]);

  // Then
  assert.equal(result.source, 'manifest');
  assert.equal(result.versions[ui], '0.1.4');
});

test('preserves compatible visual and tooling versions without classification', async () => {
  // Given
  const root = await project({ [ui]: '^0.1.0', [tokens]: '^0.2.0' });
  await installedPackage(root, ui, '0.1.0');
  await installedPackage(root, tokens, '0.2.0');

  // When
  const result = await resolveInstalledPopcandyVersions(root, [ui, tokens]);

  // Then
  assert.deepEqual(result.versions, { [tokens]: '0.2.0', [ui]: '0.1.0' });
});

test('returns none for no declared Unpopping Candy packages', async () => {
  // Given
  const root = await project();

  // When
  const result = await resolveInstalledPopcandyVersions(root, []);

  // Then
  assert.deepEqual(result, { versions: {}, source: 'none', evidencePaths: [] });
});

test('fails closed for unsupported and incomplete installations', async (t) => {
  // Given
  const root = await project({ [ui]: '^0.1.0' });
  const pnpRoot = await project({ [ui]: '^0.1.0' });
  await writeFile(join(pnpRoot, '.pnp.cjs'), 'module.exports = {};\n');
  const npmV2Root = await project({ [ui]: '^0.1.0' });
  await writeFile(join(npmV2Root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 2 }));
  const yarnRoot = await project({ [ui]: '^0.1.0' });
  await writeFile(join(yarnRoot, 'yarn.lock'), '__metadata:\n  version: 8\n');
  const bunRoot = await project({ [ui]: '^0.1.0' });
  await writeFile(join(bunRoot, 'bun.lock'), 'bun lockfile');
  const aliasRoot = await project({ [ui]: 'npm:@unpopping-candy/ui@0.1.4' });
  await writeFile(join(aliasRoot, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: {} }));
  const pnpmAliasRoot = await project({ [ui]: '^0.1.0' });
  await writeFile(join(pnpmAliasRoot, 'pnpm-lock.yaml'), [
    "lockfileVersion: '9.0'",
    'importers:',
    '  .:',
    '    dependencies:',
    '      "@unpopping-candy/ui":',
    '        version: link:../ui',
  ].join('\n'));
  const partialRoot = await project({ [ui]: '^0.1.0', [tokens]: '^0.1.0' });
  await writeFile(join(partialRoot, 'package-lock.json'), JSON.stringify({
    lockfileVersion: 3,
    packages: { 'node_modules/@unpopping-candy/ui': { version: '0.1.4' } },
  }));

  // When / Then
  await t.test('missing installation', () => expectError(resolveInstalledPopcandyVersions(root, [ui]), 'POPCANDY_DEPENDENCIES_NOT_INSTALLED'));
  await t.test('Yarn PnP', () => expectError(resolveInstalledPopcandyVersions(pnpRoot, [ui]), 'POPCANDY_PNP_UNSUPPORTED'));
  await t.test('npm lockfile v2', () => expectError(resolveInstalledPopcandyVersions(npmV2Root, [ui]), 'POPCANDY_LOCKFILE_UNSUPPORTED'));
  await t.test('Yarn lockfile only', () => expectError(resolveInstalledPopcandyVersions(yarnRoot, [ui]), 'POPCANDY_LOCKFILE_UNSUPPORTED'));
  await t.test('Bun lockfile only', () => expectError(resolveInstalledPopcandyVersions(bunRoot, [ui]), 'POPCANDY_LOCKFILE_UNSUPPORTED'));
  await t.test('unresolved alias', () => expectError(resolveInstalledPopcandyVersions(aliasRoot, [ui]), 'POPCANDY_LOCKFILE_UNSUPPORTED'));
  await t.test('unresolved pnpm alias', () => expectError(resolveInstalledPopcandyVersions(pnpmAliasRoot, [ui]), 'POPCANDY_LOCKFILE_UNSUPPORTED'));
  await t.test('partial npm lockfile', () => expectError(resolveInstalledPopcandyVersions(partialRoot, [ui, tokens]), 'POPCANDY_DEPENDENCIES_NOT_INSTALLED'));
});
