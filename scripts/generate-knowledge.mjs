import { createHash } from 'node:crypto';
import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createCatalog, validateCatalog } from '../packages/knowledge/src/catalog.ts';
import { dependencyClosedPackageSets } from '../packages/knowledge/src/compatibility.ts';
import { defineComponentDoc, defineMigrationDoc, definePatternDoc, defineTemplateDoc } from '../packages/knowledge/src/define.ts';
import { extractComponentApi, extractExportedInterfaces } from '../packages/knowledge/src/source-api.ts';
import { stableStringify } from '../packages/knowledge/src/stable-json.ts';

const repositoryRoot = resolve(new URL('..', import.meta.url).pathname);
const checkOnly = process.argv.includes('--check');
const fixedGeneratedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1_000).toISOString()
  : '2026-08-09T00:00:00.000Z';

async function listFiles(directory, predicate) {
  const output = [];
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (predicate(path)) output.push(path);
    }
  }
  await visit(directory);
  return output.sort((a, b) => a.localeCompare(b));
}

function validateEntry(entry) {
  if (!entry || typeof entry !== 'object') throw new Error('Knowledge module must export an object.');
  switch (entry.kind) {
    case 'component': return defineComponentDoc(entry);
    case 'pattern': return definePatternDoc(entry);
    case 'template': return defineTemplateDoc(entry);
    case 'migration': return defineMigrationDoc(entry);
    default: throw new Error(`Unsupported knowledge kind: ${String(entry.kind)}`);
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function collectTokenNames() {
  const css = await readFile(join(repositoryRoot, 'packages/tokens/src/styles.css'), 'utf8');
  return new Set([...css.matchAll(/--popcandy-[a-z0-9-]+/g)].map((match) => match[0]));
}

async function packageExportMap() {
  const output = new Map();
  for (const packageDirectory of ['ui', 'social']) {
    const manifest = await readJson(join(repositoryRoot, 'packages', packageDirectory, 'package.json'));
    const entrypoints = new Set();
    for (const subpath of Object.keys(manifest.exports ?? {})) {
      if (subpath.endsWith('.css') || subpath.endsWith('.json')) continue;
      entrypoints.add(subpath === '.' ? manifest.name : `${manifest.name}/${subpath.replace(/^\.\//, '')}`);
    }
    output.set(manifest.name, entrypoints);
  }
  return output;
}

function stableDigest(value) {
  return createHash('sha256').update(stableStringify(value)).digest('hex');
}

function generatedCatalogModule(catalog) {
  return `import type { KnowledgeCatalog } from '../types.ts';\n\nexport const bundledCatalog = ${JSON.stringify(catalog, null, 2)} as const satisfies KnowledgeCatalog;\n`;
}

function generatedCompatibilityModule(manifest) {
  return `import type { CompatibilityManifest } from '../types.ts';\n\nexport const bundledCompatibilityManifest = ${JSON.stringify(manifest, null, 2)} as const satisfies CompatibilityManifest;\n`;
}

async function expectedOutputs(catalog, compatibilityManifest, tokensJson) {
  const components = catalog.entries.filter((entry) => entry.kind === 'component');
  const patterns = catalog.entries.filter((entry) => entry.kind === 'pattern');
  const templates = catalog.entries.filter((entry) => entry.kind === 'template');
  const migrations = catalog.entries.filter((entry) => entry.kind === 'migration');
  const digest = stableDigest(catalog.entries);
  return new Map([
    [join(repositoryRoot, 'packages/knowledge/src/generated/catalog.ts'), generatedCatalogModule(catalog)],
    [join(repositoryRoot, 'packages/knowledge/src/generated/compatibility.ts'), generatedCompatibilityModule(compatibilityManifest)],
    [join(repositoryRoot, 'agent/manifests/catalog.json'), stableStringify(catalog)],
    [join(repositoryRoot, 'agent/manifests/compatibility.json'), stableStringify(compatibilityManifest)],
    [join(repositoryRoot, 'agent/manifests/components.json'), stableStringify({ schemaVersion: 1, generatedAt: catalog.generatedAt, entries: components })],
    [join(repositoryRoot, 'agent/manifests/patterns.json'), stableStringify({ schemaVersion: 1, generatedAt: catalog.generatedAt, entries: patterns })],
    [join(repositoryRoot, 'agent/manifests/templates.json'), stableStringify({ schemaVersion: 1, generatedAt: catalog.generatedAt, entries: templates })],
    [join(repositoryRoot, 'agent/manifests/migrations.json'), stableStringify({ schemaVersion: 1, generatedAt: catalog.generatedAt, entries: migrations })],
    [join(repositoryRoot, 'agent/manifests/tokens.json'), stableStringify(tokensJson)],
    [join(repositoryRoot, 'agent/manifests/build.json'), stableStringify({
      schemaVersion: 1,
      generatedAt: catalog.generatedAt,
      packageVersion: catalog.packageVersion,
      sourceDigest: digest,
      counts: { components: components.length, patterns: patterns.length, templates: templates.length, migrations: migrations.length },
    })],
  ]);
}

async function assertCatalogContracts(catalog, metadataFiles) {
  const errors = validateCatalog(catalog).filter((issue) => issue.severity === 'error').map((issue) => `${issue.entryId ?? 'catalog'}: ${issue.message}`);
  const tokenNames = await collectTokenNames();
  const exportsByPackage = await packageExportMap();
  const seenStories = new Set();
  for (const entry of catalog.entries) {
    if (entry.kind !== 'component') continue;
    try { await access(join(repositoryRoot, entry.sourcePath)); } catch { errors.push(`${entry.id}: source does not exist: ${entry.sourcePath}`); }
    const allowed = exportsByPackage.get(entry.package);
    for (const entrypoint of entry.entrypoints) if (!allowed?.has(entrypoint)) errors.push(`${entry.id}: unknown package entrypoint ${entrypoint}`);
    for (const token of entry.tokens) if (!tokenNames.has(token)) errors.push(`${entry.id}: unknown token ${token}`);
    if (!entry.stories.length) errors.push(`${entry.id}: at least one Storybook story is required`);
    for (const story of entry.stories) {
      if (!/^[a-z0-9-]+--[a-z0-9-]+$/.test(story)) errors.push(`${entry.id}: invalid story id ${story}`);
      if (seenStories.has(story)) errors.push(`${entry.id}: duplicate story id ${story}`);
      seenStories.add(story);
    }
  }
  const stableComponents = catalog.entries.filter((entry) => entry.kind === 'component' && entry.status === 'stable');
  if (stableComponents.length !== 32) errors.push(`catalog: expected 32 stable public components, found ${stableComponents.length}`);
  if (metadataFiles.length !== catalog.entries.length) errors.push(`catalog: loaded ${catalog.entries.length} entries from ${metadataFiles.length} metadata files`);
  if (errors.length) throw new Error(`Knowledge validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

async function writeOrCheck(outputs) {
  const stale = [];
  for (const [path, content] of outputs) {
    let current = null;
    try { current = await readFile(path, 'utf8'); } catch {}
    if (current === content) continue;
    if (checkOnly) stale.push(relative(repositoryRoot, path));
    else {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, 'utf8');
    }
  }
  if (stale.length) throw new Error(`Generated knowledge is stale:\n${stale.map((path) => `- ${path}`).join('\n')}`);
}

const metadataRoots = [
  join(repositoryRoot, 'packages/ui/src'),
  join(repositoryRoot, 'packages/social/src'),
  join(repositoryRoot, 'packages/knowledge/content'),
];
const metadataFiles = (await Promise.all(metadataRoots.map((root) => listFiles(root, (path) => path.endsWith('.docs.ts'))))).flat().sort((a, b) => a.localeCompare(b));
const sourceFiles = (await Promise.all([
  join(repositoryRoot, 'packages/ui/src'),
  join(repositoryRoot, 'packages/social/src'),
].map((root) => listFiles(root, (path) => path.endsWith('.tsx'))))).flat();
const interfaceRegistry = new Map();
for (const sourceFile of sourceFiles) {
  const source = await readFile(sourceFile, 'utf8');
  for (const [name, entry] of extractExportedInterfaces(source)) {
    if (interfaceRegistry.has(name)) throw new Error(`Duplicate exported interface name: ${name}`);
    interfaceRegistry.set(name, entry);
  }
}

const entries = [];
for (const file of metadataFiles) {
  const metadataSource = await readFile(file, 'utf8');
  if (!metadataSource.startsWith('export default {') || !metadataSource.trimEnd().endsWith('as const;')) {
    throw new Error(`${relative(repositoryRoot, file)}: metadata must be a data-only default object literal`);
  }
  if (/^\s*import\s/m.test(metadataSource) || /^\s*export\s+(?!default)/m.test(metadataSource)) {
    throw new Error(`${relative(repositoryRoot, file)}: metadata must not import or export runtime code`);
  }
  const module = await import(`${pathToFileURL(file).href}?knowledge=${encodeURIComponent(relative(repositoryRoot, file))}`);
  try {
    let metadata = module.default;
    if (metadata.kind === 'component') {
      const componentSource = await readFile(join(repositoryRoot, metadata.sourcePath), 'utf8');
      const api = extractComponentApi(componentSource, metadata.name, interfaceRegistry);
      metadata = { ...metadata, props: api.props, ...(api.nativeElement ? { nativeElement: api.nativeElement } : {}) };
    }
    entries.push(validateEntry(metadata));
  }
  catch (error) { throw new Error(`${relative(repositoryRoot, file)}: ${error instanceof Error ? error.message : String(error)}`); }
}
const knowledgeManifest = await readJson(join(repositoryRoot, 'packages/knowledge/package.json'));
const catalog = createCatalog(entries, { generatedAt: fixedGeneratedAt, packageVersion: knowledgeManifest.version });
await assertCatalogContracts(catalog, metadataFiles);
const publicPackageDirectories = ['tokens', 'theme', 'icons', 'ui', 'social', 'knowledge', 'registry', 'cli', 'mcp'];
const publicPackageManifests = (await Promise.all(
  publicPackageDirectories.map((directory) =>
    readJson(join(repositoryRoot, 'packages', directory, 'package.json')),
  ),
)).sort((left, right) => left.name.localeCompare(right.name));
const compatibilityManifest = {
  schemaVersion: 1,
  generatedAt: catalog.generatedAt,
  releases: [
    {
      catalogVersion: catalog.packageVersion,
      catalogDigest: stableDigest(catalog),
      publicPackageVersions: Object.fromEntries(
        publicPackageManifests.map((manifest) => [manifest.name, manifest.version]),
      ),
      allowedPackageSets: dependencyClosedPackageSets(publicPackageManifests),
    },
  ],
};
const tokensJson = await readJson(join(repositoryRoot, 'packages/tokens/src/tokens.json'));
await writeOrCheck(await expectedOutputs(catalog, compatibilityManifest, tokensJson));
console.log(`${checkOnly ? 'Verified' : 'Generated'} ${catalog.entries.length} knowledge entries (${catalog.entries.filter((entry) => entry.kind === 'component').length} components).`);
