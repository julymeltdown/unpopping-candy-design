import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { composeInterfacePlan, detectPopcandyProject, validatePopcandyProject } from '../../cli/src/index.ts';
import { bundledCatalog, generateDesignMarkdown, getCatalogEntry, searchCatalog } from '../../knowledge/src/index.ts';
import tokens from '../../tokens/src/tokens.json' with { type: 'json' };
import { createRegistryService } from '../../registry/src/index.ts';
import { createPopcandyMcpDomain } from '../src/domain.ts';

const search = (query: string, options?: Parameters<typeof searchCatalog>[2]) => searchCatalog(bundledCatalog, query, options);
const registry = createRegistryService({ catalog: bundledCatalog, templateRoot: join(resolve(new URL('../../..', import.meta.url).pathname), 'packages/registry/templates') });
const domain = createPopcandyMcpDomain({
  catalog: bundledCatalog,
  designMarkdown: generateDesignMarkdown(bundledCatalog, tokens),
  tokens,
  projectInfo: detectPopcandyProject,
  validate: (path) => validatePopcandyProject(bundledCatalog, path),
  search,
  get: (id) => getCatalogEntry(bundledCatalog, id),
  compose: (request) => composeInterfacePlan(bundledCatalog, request, search),
  registryManifest: registry.manifest,
  scaffold: registry.scaffold,
});

test('resource list exposes static context and every versioned catalog entry', () => {
  const resources = domain.listResources();
  assert.equal(resources.length, 49);
  assert.ok(resources.some((resource) => resource.uri === 'popcandy://design/current'));
  assert.ok(resources.some((resource) => resource.uri === 'popcandy://registry'));
  assert.ok(resources.some((resource) => resource.uri === 'popcandy://components/ui.button'));
  assert.equal(new Set(resources.map((resource) => resource.uri)).size, resources.length);
});

test('dynamic component resources return exact structured metadata', async () => {
  const resource = await domain.readResource('popcandy://components/ui.button');
  assert.equal(resource.mimeType, 'application/json');
  const entry = JSON.parse(resource.text);
  assert.equal(entry.id, 'ui.button');
  assert.equal(entry.version, '0.1.0');
  assert.ok(entry.accessibility.requirements.length >= 2);
});

test('search and composition tools remain bounded and version-aware', () => {
  const searchResult = domain.search({ query: 'social feed', limit: 500 }) as { catalogVersion: string; results: unknown[] };
  assert.equal(searchResult.catalogVersion, '0.2.0');
  assert.ok(searchResult.results.length <= 20);
  const plan = domain.compose({ request: 'social feed page' }) as { components: unknown[]; steps: { phase: string }[] };
  assert.ok(plan.components.length <= 14);
  assert.equal(plan.steps.at(-1)?.phase, 'verify');
});

test('project and validation tools read the selected local root without mutation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-mcp-'));
  await mkdir(join(root, 'src'));
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'fixture', dependencies: { react: '19.2.0', vite: '8.1.0', '@unpopping-candy/ui': '0.1.0' } }));
  await writeFile(join(root, 'src/app.tsx'), "import { Button } from '@unpopping-candy/ui/src/button/button';\nexport const App=()=> <Button>Save</Button>;\n");
  const info = await domain.projectInfo({ path: root }) as { project: { root: string } };
  assert.equal(info.project.root, root);
  const validation = await domain.validate({ path: root }) as { summary: { errors: number } };
  assert.equal(validation.summary.errors, 1);
});

test('prompts encode the mandatory detect-search-compose-validate workflow', () => {
  assert.equal(domain.listPrompts().length, 4);
  const prompt = domain.getPrompt('build-interface', { task: 'profile settings', path: '/workspace/app' });
  assert.match(prompt.text, /popcandy:\/\/project\/info/);
  assert.match(prompt.text, /popcandy_search/);
  assert.match(prompt.text, /popcandy_compose/);
  assert.match(prompt.text, /popcandy_validate/);
});

test('unknown resources and entries fail instead of returning invented context', async () => {
  await assert.rejects(domain.readResource('popcandy://components/ui.missing'), /not found/i);
  assert.throws(() => domain.get({ id: 'ui.missing' }), /not found/i);
});


test('scaffold tool is dry-run by default and writes only after explicit apply', async () => {
  const root = await mkdtemp(join(tmpdir(), 'popcandy-mcp-scaffold-'));
  const dryRun = await domain.scaffold({ templateId: 'template.profile-settings', path: root, targetDirectory: 'profile', variables: { componentPrefix: 'Agent' } }) as { mode: string; applied: boolean };
  assert.equal(dryRun.mode, 'dry-run');
  assert.equal(dryRun.applied, false);
  const applied = await domain.scaffold({ templateId: 'template.profile-settings', path: root, targetDirectory: 'profile', variables: { componentPrefix: 'Agent' }, apply: true }) as { applied: boolean };
  assert.equal(applied.applied, true);
  assert.match(await (await import('node:fs/promises')).readFile(join(root, 'profile/src/profile-settings.tsx'), 'utf8'), /AgentProfileSettings/);
});
