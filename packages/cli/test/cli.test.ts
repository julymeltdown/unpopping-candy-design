import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { bundledCatalog, getCatalogEntry, searchCatalog } from '../../knowledge/src/index.ts';
import { createRegistryService } from '../../registry/src/index.ts';
import { executeCliCommand } from '../src/commands.ts';
import { composeInterfacePlan } from '../src/compose.ts';
import { detectCommonspaceProject } from '../src/project-info.ts';
import { validateCommonspaceProject } from '../src/validate.ts';

const search = (query: string, options?: Parameters<typeof searchCatalog>[2]) => searchCatalog(bundledCatalog, query, options);
const registry = createRegistryService({ catalog: bundledCatalog, templateRoot: join(resolve(new URL('../../..', import.meta.url).pathname), 'packages/registry/templates') });
const services = {
  catalog: bundledCatalog,
  projectInfo: detectCommonspaceProject,
  validate: (path: string) => validateCommonspaceProject(bundledCatalog, path),
  search,
  get: (idOrName: string) => getCatalogEntry(bundledCatalog, idOrName),
  scaffold: registry.scaffold,
};

async function fixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'commonspace-cli-'));
  await mkdir(join(root, 'src'), { recursive: true });
  await writeFile(join(root, 'package.json'), JSON.stringify({
    name: 'fixture-app', packageManager: 'pnpm@11.4.0',
    dependencies: { react: '19.2.0', vite: '8.1.0', '@commonspace/ui': '0.1.0', '@commonspace/theme': '0.1.0', '@commonspace/tokens': '0.1.0' },
  }));
  await writeFile(join(root, 'commonspace.config.json'), JSON.stringify({ source: 'src' }));
  await writeFile(join(root, 'src/main.tsx'), [
    "import '@commonspace/tokens/styles.css';",
    "import '@commonspace/icons/styles.css';",
    "import '@commonspace/ui/styles.css';",
    "import { Button } from '@commonspace/ui/button';",
    'export const App = () => <Button>Save</Button>;',
  ].join('\n'));
  return root;
}

test('project detection reports exact Commonspace and framework context', async () => {
  const root = await fixture();
  const info = await detectCommonspaceProject(join(root, 'src'));
  assert.equal(info.root, root);
  assert.equal(info.framework, 'vite-react');
  assert.equal(info.packageManager, 'pnpm');
  assert.equal(info.installed['@commonspace/ui'], '0.1.0');
  assert.deepEqual(info.styleImports, ['@commonspace/icons/styles.css', '@commonspace/tokens/styles.css', '@commonspace/ui/styles.css']);
});

test('search and get commands use the exact bundled catalog', async () => {
  const searchResult = await executeCliCommand(services, 'search', ['social', 'feed', '--json']);
  assert.equal(searchResult.ok, true);
  if (!searchResult.ok) throw new Error(searchResult.error.message);
  assert.ok((searchResult.data as { results: { id: string }[] }).results.some((result) => result.id === 'pattern.social-feed'));
  const getResult = await executeCliCommand(services, 'get', ['Button']);
  assert.equal(getResult.ok, true);
  if (!getResult.ok) throw new Error(getResult.error.message);
  assert.equal((getResult.data as { id: string }).id, 'ui.button');
});

test('composition planning returns a bounded implementation and verification sequence', () => {
  const plan = composeInterfacePlan(bundledCatalog, 'social feed page', search);
  assert.equal(plan.catalogVersion, '0.2.0');
  assert.ok(plan.patterns.some((entry) => entry.id === 'pattern.social-feed'));
  assert.ok(plan.components.some((entry) => entry.id === 'social.timeline-view'));
  assert.equal(plan.steps.at(-1)?.phase, 'verify');
  assert.ok(plan.components.length <= 14);
});

test('validation rejects private imports and reports hardcoded visual values', async () => {
  const root = await fixture();
  await writeFile(join(root, 'src/bad.tsx'), [
    "import { Button } from '@commonspace/ui/src/button/button';",
    "export const Bad = () => <div style={{ color: '#ff00aa' }}><Button>Save</Button></div>;",
  ].join('\n'));
  const report = await validateCommonspaceProject(bundledCatalog, root);
  assert.ok(report.issues.some((issue) => issue.code === 'deep-import' && issue.severity === 'error'));
  assert.ok(report.issues.some((issue) => issue.code === 'hardcoded-color' && issue.severity === 'warning'));
});

test('doctor reports missing installation and style prerequisites without mutating the project', async () => {
  const root = await mkdtemp(join(tmpdir(), 'commonspace-doctor-'));
  await mkdir(join(root, 'src'));
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'empty', dependencies: { react: '19.2.0', vite: '8.1.0' } }));
  const result = await executeCliCommand(services, 'doctor', [], root);
  assert.equal(result.ok, true);
  if (!result.ok) throw new Error(result.error.message);
  const recommendations = (result.data as { recommendations: string[] }).recommendations;
  assert.ok(recommendations.some((item) => item.includes('@commonspace/ui')));
  assert.ok(recommendations.some((item) => item.includes('commonspace.config.json')));
});


test('scaffold defaults to dry-run and requires explicit apply for writes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'commonspace-cli-scaffold-'));
  const dryRun = await executeCliCommand(services, 'scaffold', ['template.profile-settings', '--target', 'features/profile'], root);
  assert.equal(dryRun.ok, true);
  if (!dryRun.ok) throw new Error(dryRun.error.message);
  assert.equal((dryRun.data as { mode: string; applied: boolean }).mode, 'dry-run');
  await assert.rejects(readFile(join(root, 'features/profile/src/profile-settings.tsx'), 'utf8'));

  const applied = await executeCliCommand(services, 'scaffold', ['template.profile-settings', '--target', 'features/profile', '--var', 'componentPrefix=Account', '--apply'], root);
  assert.equal(applied.ok, true);
  if (!applied.ok) throw new Error(applied.error.message);
  assert.equal((applied.data as { applied: boolean }).applied, true);
  assert.match(await readFile(join(root, 'features/profile/src/profile-settings.tsx'), 'utf8'), /AccountProfileSettings/);
});

test('validation honors configured exclusions and additional public entrypoints', async () => {
  const root = await fixture();
  await mkdir(join(root, 'test'), { recursive: true });
  await writeFile(join(root, 'commonspace.config.json'), JSON.stringify({
    schemaVersion: 1,
    validation: {
      exclude: ['test/**'],
      allowedEntrypoints: ['@commonspace/knowledge'],
    },
  }));
  await writeFile(join(root, 'src/tool.ts'), "import type { KnowledgeCatalog } from '@commonspace/knowledge';\nexport type Catalog = KnowledgeCatalog;\n");
  await writeFile(join(root, 'test/intentional-invalid.tsx'), "import { Button } from '@commonspace/ui/src/button/button';\nexport const Bad = () => <div style={{ color: '#ff00aa' }}><Button>Save</Button></div>;\n");
  const report = await validateCommonspaceProject(bundledCatalog, root);
  assert.equal(report.summary.errors, 0);
  assert.equal(report.summary.warnings, 0);
  assert.ok(report.filesScanned >= 2);
  assert.ok(report.issues.every((issue) => issue.file !== 'test/intentional-invalid.tsx'));
});
