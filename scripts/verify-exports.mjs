import { access } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { listFiles, readJson, repositoryRoot } from './lib/project-inspection.mjs';

const root = repositoryRoot();
const manifests = await listFiles(join(root, 'packages'), (path) => path.endsWith('/package.json'));
const errors = [];
for (const manifestPath of manifests) {
  const manifest = await readJson(manifestPath);
  const packageRoot = dirname(manifestPath);
  for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
    if (subpath.endsWith('.css') || subpath.endsWith('.json')) {
      const sourceName = subpath.replace('./', '');
      const sourceCandidate = join(packageRoot, 'src', sourceName === 'styles.css' ? 'styles.css' : sourceName);
      try { await access(sourceCandidate); } catch { errors.push(`${manifest.name}: ${subpath} has no source asset ${sourceCandidate}`); }
      continue;
    }
    const conditions = typeof target === 'string' ? { import: target } : target;
    const importTarget = conditions.import;
    const typeTarget = conditions.types;
    if (!importTarget || !typeTarget) { errors.push(`${manifest.name}: ${subpath} must expose import and types`); continue; }
    const entryName = subpath === '.' ? 'index' : basename(subpath);
    try { await access(join(packageRoot, 'src', `${entryName}.ts`)); } catch { errors.push(`${manifest.name}: missing source entry src/${entryName}.ts`); }
    if (importTarget !== `./dist/${entryName}.js`) errors.push(`${manifest.name}: ${subpath} import target must be ./dist/${entryName}.js`);
    if (typeTarget !== `./dist/${entryName}.d.ts`) errors.push(`${manifest.name}: ${subpath} type target must be ./dist/${entryName}.d.ts`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Public export maps verified.');
