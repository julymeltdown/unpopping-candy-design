import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { composeInterfacePlan, detectCommonspaceProject, validateCommonspaceProject } from '../../cli/src/index.ts';
import { bundledCatalog, generateDesignMarkdown, getCatalogEntry, searchCatalog } from '../../knowledge/src/index.ts';
import tokens from '../../tokens/src/tokens.json' with { type: 'json' };
import { createCommonspaceMcpDomain } from '../src/domain.ts';

const search = (query: string, options?: Parameters<typeof searchCatalog>[2]) => searchCatalog(bundledCatalog, query, options);
const domain = createCommonspaceMcpDomain({
  catalog: bundledCatalog,
  designMarkdown: generateDesignMarkdown(bundledCatalog, tokens),
  tokens,
  projectInfo: detectCommonspaceProject,
  validate: (path) => validateCommonspaceProject(bundledCatalog, path),
  search,
  get: (id) => getCatalogEntry(bundledCatalog, id),
  compose: (request) => composeInterfacePlan(bundledCatalog, request, search),
});

test('resource list exposes static context and every versioned catalog entry', () => {
  const resources = domain.listResources();
  assert.equal(resources.length, 48);
  assert.ok(resources.some((resource) => resource.uri === 'commonspace://design/current'));
  assert.ok(resources.some((resource) => resource.uri === 'commonspace://components/ui.button'));
  assert.equal(new Set(resources.map((resource) => resource.uri)).size, resources.length);
});

test('dynamic component resources return exact structured metadata', async () => {
  const resource = await domain.readResource('commonspace://components/ui.button');
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
  const root = await mkdtemp(join(tmpdir(), 'commonspace-mcp-'));
  await mkdir(join(root, 'src'));
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'fixture', dependencies: { react: '19.2.0', vite: '8.1.0', '@commonspace/ui': '0.1.0' } }));
  await writeFile(join(root, 'src/app.tsx'), "import { Button } from '@commonspace/ui/src/button/button';\nexport const App=()=> <Button>Save</Button>;\n");
  const info = await domain.projectInfo({ path: root }) as { project: { root: string } };
  assert.equal(info.project.root, root);
  const validation = await domain.validate({ path: root }) as { summary: { errors: number } };
  assert.equal(validation.summary.errors, 1);
});

test('prompts encode the mandatory detect-search-compose-validate workflow', () => {
  assert.equal(domain.listPrompts().length, 4);
  const prompt = domain.getPrompt('build-interface', { task: 'profile settings', path: '/workspace/app' });
  assert.match(prompt.text, /commonspace:\/\/project\/info/);
  assert.match(prompt.text, /commonspace_search/);
  assert.match(prompt.text, /commonspace_compose/);
  assert.match(prompt.text, /commonspace_validate/);
});

test('unknown resources and entries fail instead of returning invented context', async () => {
  await assert.rejects(domain.readResource('commonspace://components/ui.missing'), /not found/i);
  assert.throws(() => domain.get({ id: 'ui.missing' }), /not found/i);
});
