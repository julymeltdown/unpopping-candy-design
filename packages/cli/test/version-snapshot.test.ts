import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { PopcandyProjectError } from '../src/project-errors.ts';
import { resolveInstalledPopcandyVersions } from '../src/version-resolution.ts';

const ui = '@unpopping-candy/ui';

async function snapshotProject(version: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-version-snapshot-'));
  await writeFile(join(root, 'package.json'), JSON.stringify({ dependencies: { [ui]: '^0.1.0' } }));
  await writeFile(join(root, 'pnpm-lock.yaml'), [
    "lockfileVersion: '9.0'", 'importers:', '  .:', '    dependencies:',
    '      "@unpopping-candy/ui":', `        version: ${version}`,
  ].join('\n'));
  return root;
}

async function expectUnsupported(version: string): Promise<void> {
  await assert.rejects(
    resolveInstalledPopcandyVersions(await snapshotProject(version), [ui]),
    (error: unknown) => error instanceof PopcandyProjectError && error.code === 'POPCANDY_LOCKFILE_UNSUPPORTED',
  );
}

test('resolves a strict nested and scoped pnpm peer snapshot', async () => {
  // Given
  const root = await snapshotProject('1.2.3-alpha.1+build.7(@scope/peer.name@19.2.8(react-dom@19.2.8))(react-dom@19.2.8)');

  // When
  const result = await resolveInstalledPopcandyVersions(root, [ui]);

  // Then
  assert.deepEqual(result.versions, { [ui]: '1.2.3-alpha.1+build.7' });
  assert.equal(result.source, 'pnpm-lock-v9');
});

test('resolves alphanumeric prerelease identifiers in root and nested peer snapshots', async () => {
  // Given
  const versions = ['1.2.3-1a', '1.2.3-0alpha', '1.2.3-123abc', '1.2.3-alpha.01a'];

  // When / Then
  for (const version of versions) {
    const result = await resolveInstalledPopcandyVersions(await snapshotProject(version), [ui]);
    assert.equal(result.versions[ui], version);
  }
  const nested = await resolveInstalledPopcandyVersions(await snapshotProject('1.2.3(react@4.5.6-1a+build.2)'), [ui]);
  assert.equal(nested.versions[ui], '1.2.3');
});

test('rejects malformed pnpm peer snapshots', async (t) => {
  // Given
  const invalidSnapshots = [
    '0.1.4(garbage)', '0.1.4((react@19.2.8))', '0.1.4( )',
    '01.2.3', '1.2.3-01', '1.2.3-alpha..1', '0.1.4(react@^19.2.8)',
    '0.1.4(react@workspace:*)', '0.1.4(react@npm:react-dom@19.2.8)',
  ];

  // When / Then
  for (const snapshot of invalidSnapshots) {
    await t.test(snapshot, () => expectUnsupported(snapshot));
  }
});
