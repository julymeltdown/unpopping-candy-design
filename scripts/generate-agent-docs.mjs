import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundledCatalog, generateAgentDocumentSet } from '../packages/knowledge/src/index.ts';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const tokens = JSON.parse(await readFile(join(repositoryRoot, 'packages/tokens/src/tokens.json'), 'utf8'));
const files = generateAgentDocumentSet(bundledCatalog, tokens);
const expected = new Map(files.map((file) => [join(repositoryRoot, file.path), file.content]));
const generatedDirectories = [join(repositoryRoot, 'agent/components'), join(repositoryRoot, 'agent/patterns')];

async function generatedFilesIn(directory) {
  try {
    return (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => join(directory, entry.name));
  } catch {
    return [];
  }
}

const stale = [];
for (const [path, content] of expected) {
  let current = null;
  try { current = await readFile(path, 'utf8'); } catch {}
  if (current === content) continue;
  if (checkOnly) stale.push(relative(repositoryRoot, path));
  else {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, 'utf8');
  }
}
for (const directory of generatedDirectories) {
  for (const path of await generatedFilesIn(directory)) {
    if (expected.has(path)) continue;
    if (checkOnly) stale.push(relative(repositoryRoot, path));
    else await rm(path);
  }
}
if (stale.length) {
  console.error(`Generated agent documents are stale:\n${stale.sort().map((path) => `- ${path}`).join('\n')}`);
  process.exit(1);
}
console.log(`${checkOnly ? 'Verified' : 'Generated'} ${files.length} agent documents.`);
