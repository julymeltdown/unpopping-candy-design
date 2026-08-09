import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { bundledCatalog, type KnowledgeCatalog } from '../../knowledge/src/index.ts';
import { createRegistryService } from '../src/index.ts';

const repositoryRoot = resolve(new URL('../../..', import.meta.url).pathname);
const templateRoot = join(repositoryRoot, 'packages/registry/templates');

async function exists(path: string): Promise<boolean> {
  try { await access(path); return true; } catch { return false; }
}

function service(catalog: KnowledgeCatalog = bundledCatalog) {
  return createRegistryService({ catalog, templateRoot });
}

test('registry exposes all catalog templates with deterministic checksums', async () => {
  const manifest = await service().manifest();
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.packageVersion, '0.2.0');
  assert.equal(manifest.templates.length, 5);
  assert.deepEqual(manifest.templates.map((entry) => entry.id), [...manifest.templates.map((entry) => entry.id)].sort());
  for (const template of manifest.templates) {
    assert.match(template.digest, /^[a-f0-9]{64}$/);
    assert.ok(template.files.length > 0);
    for (const file of template.files) assert.match(file.digest, /^[a-f0-9]{64}$/);
  }
});

test('dry-run produces a complete plan without mutating the target project', async () => {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-registry-dry-'));
  const plan = await service().scaffold({ templateId: 'template.vite-app-shell', projectRoot: root, mode: 'dry-run' });
  assert.equal(plan.mode, 'dry-run');
  assert.equal(plan.summary.create, 3);
  assert.equal(plan.summary.conflict, 0);
  assert.equal(plan.applied, false);
  assert.equal(await exists(join(root, 'src/app.tsx')), false);
});

test('apply writes a template once and a second run is idempotent', async () => {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-registry-apply-'));
  const first = await service().scaffold({ templateId: 'template.vite-app-shell', projectRoot: root, mode: 'apply' });
  assert.equal(first.applied, true);
  assert.equal(first.summary.create, 3);
  assert.match(await readFile(join(root, 'src/main.tsx'), 'utf8'), /UnpoppingCandyProvider/);

  const second = await service().scaffold({ templateId: 'template.vite-app-shell', projectRoot: root, mode: 'apply' });
  assert.equal(second.summary.create, 0);
  assert.equal(second.summary.unchanged, 3);
  assert.equal(second.summary.conflict, 0);
});

test('conflicting files block the entire apply before any other file is written', async () => {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-registry-conflict-'));
  await mkdir(join(root, 'src'), { recursive: true });
  await writeFile(join(root, 'src/main.tsx'), 'consumer-owned\n');
  await assert.rejects(
    service().scaffold({ templateId: 'template.vite-app-shell', projectRoot: root, mode: 'apply' }),
    /conflict/i,
  );
  assert.equal(await readFile(join(root, 'src/main.tsx'), 'utf8'), 'consumer-owned\n');
  assert.equal(await exists(join(root, 'src/app.tsx')), false);
});

test('target paths cannot escape the project root through traversal, absolute paths, or symlinks', async () => {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-registry-root-'));
  const outside = await mkdtemp(join(tmpdir(), 'popcandy-registry-outside-'));
  await assert.rejects(service().scaffold({ templateId: 'template.profile-settings', projectRoot: root, targetDirectory: '../outside', mode: 'dry-run' }), /project root/i);
  await assert.rejects(service().scaffold({ templateId: 'template.profile-settings', projectRoot: root, targetDirectory: outside, mode: 'dry-run' }), /relative/i);
  await symlink(outside, join(root, 'linked-outside'), 'dir');
  await assert.rejects(service().scaffold({ templateId: 'template.profile-settings', projectRoot: root, targetDirectory: 'linked-outside', mode: 'dry-run' }), /symlink|project root/i);
});

test('malicious registry metadata is rejected before reading a source file', async () => {
  const template = bundledCatalog.entries.find((entry) => entry.id === 'template.profile-settings');
  assert.ok(template && template.kind === 'template');
  const malicious: KnowledgeCatalog = {
    ...bundledCatalog,
    entries: bundledCatalog.entries.map((entry) => entry.id === template.id ? {
      ...template,
      files: [{ path: '../../escape.tsx', role: 'escape', source: '../../secret' }],
    } : entry),
  };
  await assert.rejects(service(malicious).manifest(), /unsafe|relative|registry source/i);
});

test('template variables are strictly allow-listed and safely substituted', async () => {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-registry-variable-'));
  const result = await service().scaffold({
    templateId: 'template.profile-settings',
    projectRoot: root,
    mode: 'apply',
    variables: { componentPrefix: 'Account' },
  });
  assert.equal(result.applied, true);
  assert.match(await readFile(join(root, 'src/profile-settings.tsx'), 'utf8'), /AccountProfileSettings/);
  await assert.rejects(service().scaffold({ templateId: 'template.profile-settings', projectRoot: root, mode: 'dry-run', variables: { unknown: 'x' } }), /unknown variable/i);
});
