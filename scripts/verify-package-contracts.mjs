import { access } from 'node:fs/promises';
import { join } from 'node:path';
import {
  classifyPackageManifest,
  PRIVATE_TOOL_PACKAGE_NAMES,
  PUBLIC_PACKAGE_NAMES,
} from './lib/public-packages.mjs';
import { listFiles, readJson, repositoryRoot } from './lib/project-inspection.mjs';

const root = repositoryRoot();
const packagesDirectory = join(root, 'packages');
const manifests = await listFiles(packagesDirectory, (path) => path.endsWith('/package.json'));
const errors = [];
const packageNames = new Set();
const baseTypeScript = await readJson(join(root, 'tsconfig.base.json'));
if (baseTypeScript.compilerOptions?.allowImportingTsExtensions !== true) errors.push('tsconfig.base.json: allowImportingTsExtensions must be true while source imports use .ts extensions');
if (baseTypeScript.compilerOptions?.rewriteRelativeImportExtensions !== true) errors.push('tsconfig.base.json: rewriteRelativeImportExtensions must be true so emitted JavaScript resolves .js files');

for (const manifestPath of manifests) {
  const manifest = await readJson(manifestPath);
  const label = manifest.name ?? manifestPath;
  const packageType = classifyPackageManifest(manifest);
  packageNames.add(manifest.name);

  if (packageType === 'unknown') {
    errors.push(`${label}: package directory is not part of the public or private tooling policy`);
    continue;
  }

  if (packageType === 'private-tool') {
    if (manifest.private !== true) errors.push(`${label}: private tooling package must be marked private`);
    if (manifest.publishConfig) errors.push(`${label}: private tooling package must not define publishConfig`);
    continue;
  }

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
    if (name.startsWith('@unpopping-candy/') && !String(version).startsWith('workspace:')) errors.push(`${label}: internal dependency ${name} must use workspace protocol`);
  }
  try {
    await access(join(manifestPath, '..', 'README.md'));
  } catch (error) {
    if (error?.code === 'ENOENT') errors.push(`${label}: package README.md is required`);
    else throw error;
  }
}

for (const packageName of [...PUBLIC_PACKAGE_NAMES, ...PRIVATE_TOOL_PACKAGE_NAMES]) {
  if (!packageNames.has(packageName)) errors.push(`${packageName}: package manifest is required by package policy`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Package contracts verified for ${PUBLIC_PACKAGE_NAMES.length} publishable packages and ${PRIVATE_TOOL_PACKAGE_NAMES.length} private tools.`);
