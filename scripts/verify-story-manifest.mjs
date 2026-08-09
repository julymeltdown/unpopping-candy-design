import { readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { inspectStorySource } from './lib/story-contract.mjs';
import { listFiles, repositoryRoot } from './lib/project-inspection.mjs';
import { stableStringify } from '../packages/knowledge/src/index.ts';
import { bundledCatalog } from '../packages/knowledge/src/generated/catalog.ts';

const root = repositoryRoot();
const checkOnly = process.argv.includes('--check');
const storyRoot = join(root, 'apps/docs/stories');
const storyFiles = await listFiles(storyRoot, (path) => /\.stories\.(?:ts|tsx)$/.test(path));
const actual = new Map();
const errors = [];
for (const file of storyFiles) {
  const source = await readFile(file, 'utf8');
  let inspected;
  try { inspected = inspectStorySource(source); }
  catch (error) { errors.push(`${relative(root, file)}: ${error instanceof Error ? error.message : String(error)}`); continue; }
  for (const id of inspected.ids) {
    if (actual.has(id)) errors.push(`Duplicate Storybook id ${id}: ${actual.get(id).file} and ${relative(root, file)}`);
    actual.set(id, { id, title: inspected.title, file: relative(root, file), hasComponent: /\bcomponent\s*:/.test(source) });
  }
}
const entries = [];
for (const component of bundledCatalog.entries.filter((entry) => entry.kind === 'component')) {
  if (component.stories.length === 0) errors.push(`${component.id}: no Storybook contract story`);
  for (const story of component.stories) {
    const found = actual.get(story);
    if (!found) { errors.push(`${component.id}: missing Storybook story ${story}`); continue; }
    if (!found.hasComponent) errors.push(`${component.id}: ${story} must declare meta.component`);
    if (!found.file.includes('/catalog/')) errors.push(`${component.id}: contract story must live under apps/docs/stories/catalog`);
    entries.push({ componentId: component.id, storyId: story, file: found.file, url: `/?path=/story/${story}` });
  }
}
entries.sort((left, right) => left.componentId.localeCompare(right.componentId) || left.storyId.localeCompare(right.storyId));
if (new Set(entries.map((entry) => entry.componentId)).size !== 32) errors.push(`Expected contract stories for 32 components, found ${new Set(entries.map((entry) => entry.componentId)).size}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
const manifest = stableStringify({ schemaVersion: 1, generatedAt: bundledCatalog.generatedAt, storybookVersion: '10.5.0', mcpEndpoint: '/mcp', entries });
const output = join(root, 'agent/manifests/stories.json');
let current = null;
try { current = await readFile(output, 'utf8'); } catch {}
if (current !== manifest) {
  if (checkOnly) { console.error('Generated Storybook manifest is stale: agent/manifests/stories.json'); process.exit(1); }
  await writeFile(output, manifest, 'utf8');
}
console.log(`${checkOnly ? 'Verified' : 'Generated'} ${entries.length} catalog Storybook contracts.`);
