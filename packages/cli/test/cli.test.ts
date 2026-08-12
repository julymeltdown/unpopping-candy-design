import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { bundledCatalog, searchCatalog } from '../../knowledge/src/index.ts';
import { createRegistryService } from '../../registry/src/index.ts';
import { resolveCatalogContext, resolveProjectCatalogContext } from '../src/catalog-context.ts';
import { executeCliCommand } from '../src/commands.ts';
import { composeInterfacePlan } from '../src/compose.ts';
import { PopcandyProjectError } from '../src/project-errors.ts';
import { detectPopcandyProject } from '../src/project-info.ts';
import { validatePopcandyProject } from '../src/validate.ts';

const registry = createRegistryService({ catalog: bundledCatalog, templateRoot: join(resolve(new URL('../../..', import.meta.url).pathname), 'packages/registry/templates') });
const templateRoot = join(resolve(new URL('../../..', import.meta.url).pathname), 'packages/registry/templates');
const services = {
  projectContext: resolveProjectCatalogContext,
  catalogContext: resolveCatalogContext,
  validate: validatePopcandyProject,
  scaffold: (catalog: typeof bundledCatalog, input: Parameters<typeof registry.scaffold>[0]) => createRegistryService({ catalog, templateRoot }).scaffold(input),
};

async function fixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-cli-'));
  await mkdir(join(root, 'src'), { recursive: true });
  await writeFile(join(root, 'package.json'), JSON.stringify({
    name: 'fixture-app', packageManager: 'pnpm@11.4.0',
    dependencies: { react: '19.2.0', vite: '8.1.0', '@unpopping-candy/ui': '0.1.0', '@unpopping-candy/theme': '0.1.0', '@unpopping-candy/tokens': '0.1.0' },
  }));
  await writeFile(join(root, 'package-lock.json'), JSON.stringify({
    lockfileVersion: 3,
    packages: {
      'node_modules/@unpopping-candy/theme': { version: '0.1.0' },
      'node_modules/@unpopping-candy/tokens': { version: '0.1.0' },
      'node_modules/@unpopping-candy/ui': { version: '0.1.0' },
    },
  }));
  await writeFile(join(root, 'popcandy.config.json'), JSON.stringify({ source: 'src' }));
  await writeFile(join(root, 'src/main.tsx'), [
    "import '@unpopping-candy/tokens/styles.css';",
    "import '@unpopping-candy/icons/styles.css';",
    "import '@unpopping-candy/ui/styles.css';",
    "import type { SocialPostViewModel } from '@unpopping-candy/social/model';",
    "import { Button } from '@unpopping-candy/ui/button';",
    'export const App = (_post: SocialPostViewModel) => <Button>Save</Button>;',
  ].join('\n'));
  return root;
}

test('project detection reports exact Unpopping Candy and framework context', async () => {
  const root = await fixture();
  const info = await detectPopcandyProject(join(root, 'src'));
  assert.equal(info.root, root);
  assert.equal(info.framework, 'vite-react');
  assert.equal(info.packageManager, 'pnpm');
  assert.equal(info.installed['@unpopping-candy/ui'], '0.1.0');
  assert.deepEqual(info.styleImports, ['@unpopping-candy/icons/styles.css', '@unpopping-candy/tokens/styles.css', '@unpopping-candy/ui/styles.css']);
});

test('validation accepts the public social model entrypoint', async () => {
  const root = await fixture();
  const report = await validatePopcandyProject(bundledCatalog, root);
  assert.equal(report.summary.errors, 0);
});

test('search and get commands use the exact bundled catalog', async () => {
  const searchResult = await executeCliCommand(services, 'search', ['social', 'feed', '--json']);
  if (!searchResult.ok) throw new Error(searchResult.error.message);
  assert.equal(searchResult.ok, true);
  assert.ok((searchResult.data as { results: { id: string }[] }).results.some((result) => result.id === 'pattern.social-feed'));
  const getResult = await executeCliCommand(services, 'get', ['Button']);
  if (!getResult.ok) throw new Error(getResult.error.message);
  assert.equal(getResult.ok, true);
  assert.equal((getResult.data as { entry: { id: string } }).entry.id, 'ui.button');
});

test('composition planning returns a bounded implementation and verification sequence', () => {
  const plan = composeInterfacePlan(bundledCatalog, 'social feed page', (query, options) => searchCatalog(bundledCatalog, query, options));
  assert.equal(plan.catalogVersion, '0.2.0');
  assert.ok(plan.patterns.some((entry) => entry.id === 'pattern.social-feed'));
  assert.ok(plan.components.some((entry) => entry.id === 'social.timeline-view'));
  assert.equal(plan.steps.at(-1)?.phase, 'verify');
  assert.ok(plan.components.length <= 14);
});

test('all catalog-aware commands preserve a typed mixed-version failure after one context resolution', async () => {
  // Given a context resolver that observes a known mixed package set
  const calls: string[] = [];
  const mixedError = new PopcandyProjectError('POPCANDY_VERSION_SET_MIXED', 'Mixed package releases.');
  const mixedServices = {
    ...services,
    async projectContext(path: string) { calls.push(path); throw mixedError; },
    async catalogContext(path: string) { calls.push(path); throw mixedError; },
  };
  const commands = [
    ['info', []],
    ['search', ['button']],
    ['get', ['ui.button']],
    ['compose', ['profile settings']],
    ['validate', []],
  ] as const;

  // When each command targets the same project
  const results = await Promise.all(commands.map(([command, args]) => executeCliCommand(mixedServices, command, args, '/target')));

  // Then each resolves once and preserves the stable error code
  assert.deepEqual(calls, ['/target', '/target', '/target', '/target', '/target']);
  assert.ok(results.every((result) => !result.ok && result.error.code === 'POPCANDY_VERSION_SET_MIXED'));
});

test('empty consumers report a nullable catalog for info and fail catalog commands actionably', async () => {
  // Given an ordinary project with no Unpopping Candy dependencies or catalog config
  const root = await mkdtemp(join(tmpdir(), 'popcandy-empty-'));
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'empty-consumer' }));

  // When info and catalog-requiring commands run
  const info = await executeCliCommand(services, 'info', ['--path', root], root);
  const failures = await Promise.all([
    executeCliCommand(services, 'search', ['button', '--path', root], root),
    executeCliCommand(services, 'get', ['ui.button', '--path', root], root),
    executeCliCommand(services, 'compose', ['profile settings', '--path', root], root),
    executeCliCommand(services, 'validate', ['--path', root], root),
  ]);

  // Then info succeeds diagnostically while catalog commands fail with the typed dependency code
  assert.equal(info.ok, true);
  assert.match(JSON.stringify(info), /"installed":\{\}/);
  assert.match(JSON.stringify(info), /"catalogVersion":null/);
  assert.match(JSON.stringify(info), /POPCANDY_DEPENDENCIES_NOT_INSTALLED/);
  assert.ok(failures.every((result) => !result.ok && result.error.code === 'POPCANDY_DEPENDENCIES_NOT_INSTALLED'));
});

test('--path selects one repository catalog context and never enters search text', async () => {
  // Given the repository's explicit catalog configuration
  const repositoryRoot = resolve(new URL('../../..', import.meta.url).pathname);

  // When search targets it through the value flag
  const result = await executeCliCommand(services, 'search', ['profile', 'settings', '--path', repositoryRoot], '/unrelated');

  // Then the response is bound to repository config and the query excludes the path
  assert.equal(result.ok, true);
  assert.match(JSON.stringify(result), /"query":"profile settings"/);
  assert.match(JSON.stringify(result), /"catalogSource":"repository-config"/);
});

test('explicit catalog configuration fails closed when missing, malformed, or escaping root', async () => {
  // Given explicit configurations that cannot safely produce a valid catalog
  const cases = [
    { schemaVersion: 1, catalog: './missing.json' },
    { schemaVersion: 1, catalog: '../outside.json' },
    { schemaVersion: 1, catalog: 42 },
    { schemaVersion: 2, catalog: './catalog.json' },
    { schemaVersion: 1, catalog: '/tmp/catalog.json' },
  ] as const;

  // When each project context is resolved
  const results = await Promise.all(cases.map(async (config) => {
    const root = await mkdtemp(join(tmpdir(), 'popcandy-config-invalid-'));
    await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'fixture' }));
    await writeFile(join(root, 'popcandy.config.json'), JSON.stringify(config));
    return executeCliCommand(services, 'search', ['button', '--path', root], root);
  }));

  // Then no explicit config silently falls back to bundled catalog state
  assert.ok(results.every((result) => !result.ok && result.error.code === 'POPCANDY_CATALOG_INCOMPATIBLE'));
});

test('scaffold is bound to the selected catalog entry and source', async () => {
  const button = bundledCatalog.entries.find((entry) => entry.id === 'ui.button');
  const template = bundledCatalog.entries.find((entry) => entry.id === 'template.profile-settings');
  if (!button || button.kind !== 'component' || !template || template.kind !== 'template') throw new Error('Missing scaffold fixtures.');
  const entries = [
    { entry: { ...button, id: template.id, related: [] }, code: 'POPCANDY_CATALOG_INCOMPATIBLE', message: /unavailable/ },
    { entry: { ...template, components: [], patterns: [], variables: [], files: [{ path: 'selected.tsx', role: 'component', source: 'packages/registry/templates/missing-selected.tsx' }] }, code: 'ENOENT', message: /missing-selected/ },
  ];
  for (const selected of entries) {
    const root = await mkdtemp(join(tmpdir(), 'popcandy-scaffold-selected-'));
    await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'fixture' }));
    await writeFile(join(root, 'catalog.json'), JSON.stringify({ ...bundledCatalog, packageVersion: 'selected', entries: [selected.entry] }));
    await writeFile(join(root, 'popcandy.config.json'), JSON.stringify({ schemaVersion: 1, catalog: './catalog.json' }));
    const result = await executeCliCommand(services, 'scaffold', [template.id, '--path', root], root);
    assert.equal(result.ok, false);
    if (result.ok) throw new Error('Expected selected-catalog failure.');
    assert.equal(result.error.code, selected.code);
    assert.match(result.error.message, selected.message);
    await assert.rejects(readFile(join(root, 'selected.tsx'), 'utf8'));
  }
});

test('validation rejects private imports and reports hardcoded visual values', async () => {
  const root = await fixture();
  await writeFile(join(root, 'src/bad.tsx'), [
    "import { Button } from '@unpopping-candy/ui/src/button/button';",
    "export const Bad = () => <div style={{ color: '#ff00aa' }}><Button>Save</Button></div>;",
  ].join('\n'));
  const report = await validatePopcandyProject(bundledCatalog, root);
  assert.ok(report.issues.some((issue) => issue.code === 'deep-import' && issue.severity === 'error'));
  assert.ok(report.issues.some((issue) => issue.code === 'hardcoded-color' && issue.severity === 'warning'));
});

test('doctor reports missing installation and style prerequisites without mutating the project', async () => {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-doctor-'));
  await mkdir(join(root, 'src'));
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'empty', dependencies: { react: '19.2.0', vite: '8.1.0' } }));
  const result = await executeCliCommand(services, 'doctor', [], root);
  if (!result.ok) throw new Error(result.error.message);
  assert.equal(result.ok, true);
  const recommendations = (result.data as { recommendations: string[] }).recommendations;
  assert.ok(recommendations.some((item) => item.includes('@unpopping-candy/ui')));
  assert.ok(recommendations.some((item) => item.includes('popcandy.config.json')));
});


test('scaffold defaults to dry-run and requires explicit apply for writes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-cli-scaffold-'));
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'fixture', dependencies: { '@unpopping-candy/icons': '0.1.0', '@unpopping-candy/tokens': '0.1.0', '@unpopping-candy/ui': '0.1.0' } }));
  await writeFile(join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { 'node_modules/@unpopping-candy/icons': { version: '0.1.0' }, 'node_modules/@unpopping-candy/tokens': { version: '0.1.0' }, 'node_modules/@unpopping-candy/ui': { version: '0.1.0' } } }));
  const dryRun = await executeCliCommand(services, 'scaffold', ['template.profile-settings', '--target', 'features/profile'], root);
  if (!dryRun.ok) throw new Error(dryRun.error.message);
  assert.equal(dryRun.ok, true);
  assert.equal((dryRun.data as { mode: string; applied: boolean }).mode, 'dry-run');
  await assert.rejects(readFile(join(root, 'features/profile/src/profile-settings.tsx'), 'utf8'));

  const applied = await executeCliCommand(services, 'scaffold', ['template.profile-settings', '--target', 'features/profile', '--var', 'componentPrefix=Account', '--apply'], root);
  if (!applied.ok) throw new Error(applied.error.message);
  assert.equal(applied.ok, true);
  assert.equal((applied.data as { applied: boolean }).applied, true);
  assert.match(await readFile(join(root, 'features/profile/src/profile-settings.tsx'), 'utf8'), /AccountProfileSettings/);
});

test('validation honors configured exclusions and additional public entrypoints', async () => {
  const root = await fixture();
  await mkdir(join(root, 'test'), { recursive: true });
  await writeFile(join(root, 'popcandy.config.json'), JSON.stringify({
    schemaVersion: 1,
    validation: {
      exclude: ['test/**'],
      allowedEntrypoints: ['@unpopping-candy/knowledge'],
    },
  }));
  await writeFile(join(root, 'src/tool.ts'), "import type { KnowledgeCatalog } from '@unpopping-candy/knowledge';\nexport type Catalog = KnowledgeCatalog;\n");
  await writeFile(join(root, 'test/intentional-invalid.tsx'), "import { Button } from '@unpopping-candy/ui/src/button/button';\nexport const Bad = () => <div style={{ color: '#ff00aa' }}><Button>Save</Button></div>;\n");
  const report = await validatePopcandyProject(bundledCatalog, root);
  assert.equal(report.summary.errors, 0);
  assert.equal(report.summary.warnings, 0);
  assert.ok(report.filesScanned >= 2);
  assert.ok(report.issues.every((issue) => issue.file !== 'test/intentional-invalid.tsx'));
});
