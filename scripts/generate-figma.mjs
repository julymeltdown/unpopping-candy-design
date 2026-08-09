import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { bundledCatalog, stableStringify } from '../packages/knowledge/src/index.ts';
import { createFigmaManifest, generateCodeConnectTemplates, validateFigmaManifest } from '../packages/figma/src/index.ts';

const root = resolve(new URL('..', import.meta.url).pathname);
const checkOnly = process.argv.includes('--check');
const publishCheck = process.argv.includes('--publish-check');
const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1_000).toISOString()
  : '2026-08-09T00:00:00.000Z';
const config = JSON.parse(await readFile(join(root, 'figma/popcandy.figma.json'), 'utf8'));
const manifest = createFigmaManifest(bundledCatalog, config, generatedAt);
const issues = validateFigmaManifest(manifest, { allowPlaceholders: !publishCheck });
const errors = issues.filter((issue) => issue.severity === 'error');
if (errors.length) {
  throw new Error(`Figma mapping validation failed:\n${errors.map((issue) => `- ${issue.componentId}: ${issue.message}`).join('\n')}`);
}

const expected = new Map();
for (const file of generateCodeConnectTemplates(bundledCatalog, manifest)) expected.set(join(root, file.path), file.content);
expected.set(join(root, 'figma/manifest.json'), stableStringify(manifest));
expected.set(join(root, 'agent/manifests/figma.json'), stableStringify(manifest));

async function listGeneratedTemplates() {
  const directory = join(root, 'figma/code-connect');
  try {
    return (await readdir(directory, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.figma.ts'))
      .map((entry) => join(directory, entry.name));
  } catch { return []; }
}

const stale = [];
for (const [path, content] of expected) {
  let current = null;
  try { current = await readFile(path, 'utf8'); } catch {}
  if (current === content) continue;
  if (checkOnly || publishCheck) stale.push(relative(root, path));
  else {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, 'utf8');
  }
}
for (const path of await listGeneratedTemplates()) {
  if (expected.has(path)) continue;
  if (checkOnly || publishCheck) stale.push(relative(root, path));
  else await rm(path);
}
if (stale.length) throw new Error(`Generated Figma integration is stale:\n${stale.map((path) => `- ${path}`).join('\n')}`);
console.log(`${checkOnly || publishCheck ? 'Verified' : 'Generated'} ${manifest.components.length} Figma Code Connect templates (${manifest.components.filter((entry) => entry.status === 'ready').length} ready, ${manifest.components.filter((entry) => entry.status === 'placeholder').length} placeholders).`);
