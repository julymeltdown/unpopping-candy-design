import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { listFiles, readJson, repositoryRoot } from './lib/project-inspection.mjs';

const root = repositoryRoot();
const packagesDirectory = join(root, 'packages');
const manifests = await listFiles(packagesDirectory, (path) => path.endsWith('/package.json'));
const errors = [];
const baseTypeScript = await readJson(join(root, 'tsconfig.base.json'));
if (baseTypeScript.compilerOptions?.allowImportingTsExtensions !== true) errors.push('tsconfig.base.json: allowImportingTsExtensions must be true while source imports use .ts extensions');
if (baseTypeScript.compilerOptions?.rewriteRelativeImportExtensions !== true) errors.push('tsconfig.base.json: rewriteRelativeImportExtensions must be true so emitted JavaScript resolves .js files');

for (const manifestPath of manifests) {
  const manifest = await readJson(manifestPath);
  const label = manifest.name ?? manifestPath;
  if (manifest.private === true) errors.push(`${label}: publishable package must not be private`);
  if (!Array.isArray(manifest.files) || !manifest.files.includes('dist')) errors.push(`${label}: files must include dist`);
  if (!manifest.license) errors.push(`${label}: license field is required`);
  if (manifest.type !== 'module') errors.push(`${label}: type must be module`);
  if (!manifest.publishConfig || manifest.publishConfig.access !== 'public') errors.push(`${label}: publishConfig.access must be public`);
  for (const script of ['build', 'test', 'typecheck']) {
    if (!manifest.scripts?.[script]) errors.push(`${label}: missing ${script} script`);
  }
  const serializedExports = JSON.stringify(manifest.exports ?? {});
  if (serializedExports.includes('/src/') || serializedExports.includes('./src')) errors.push(`${label}: exports must never reference src`);
  if (manifest.peerDependencies?.react && /^\d/.test(manifest.peerDependencies.react)) errors.push(`${label}: React peer dependency must be a range`);
  if (manifest.peerDependencies?.['react-dom'] && /^\d/.test(manifest.peerDependencies['react-dom'])) errors.push(`${label}: React DOM peer dependency must be a range`);
  for (const [name, version] of Object.entries(manifest.dependencies ?? {})) {
    if (name.startsWith('@commonspace/') && !String(version).startsWith('workspace:')) errors.push(`${label}: internal dependency ${name} must use workspace protocol`);
  }
  try { await access(join(manifestPath, '..', 'README.md')); } catch { errors.push(`${label}: package README.md is required`); }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Package contracts verified for ${manifests.length} publishable packages.`);
