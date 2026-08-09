import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { createRegistryService } from '../packages/registry/src/index.ts';
import { bundledCatalog, stableStringify } from '../packages/knowledge/src/index.ts';

const repositoryRoot = resolve(new URL('..', import.meta.url).pathname);
const checkOnly = process.argv.includes('--check');
const service = createRegistryService({
  catalog: bundledCatalog,
  templateRoot: join(repositoryRoot, 'packages/registry/templates'),
});
const content = stableStringify(await service.manifest());
const outputs = [
  join(repositoryRoot, 'packages/registry/src/registry.json'),
  join(repositoryRoot, 'agent/manifests/registry.json'),
];
const stale = [];
for (const path of outputs) {
  let current = null;
  try { current = await readFile(path, 'utf8'); } catch {}
  if (current === content) continue;
  if (checkOnly) stale.push(relative(repositoryRoot, path));
  else {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, 'utf8');
  }
}
if (stale.length) throw new Error(`Generated registry is stale:\n${stale.map((path) => `- ${path}`).join('\n')}`);
console.log(`${checkOnly ? 'Verified' : 'Generated'} ${JSON.parse(content).templates.length} registry templates.`);
