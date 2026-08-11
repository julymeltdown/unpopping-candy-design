import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  classifyPackageManifest,
  PRIVATE_TOOL_PACKAGE_NAMES,
  PUBLIC_PACKAGE_NAMES,
} from './lib/public-packages.mjs';
import { listFiles, readJson, repositoryRoot } from './lib/project-inspection.mjs';

const root = repositoryRoot();
const errors = [];
const packageNames = new Set();
const license = await readFile(join(root, 'LICENSE.md'), 'utf8');
if (/\bUNLICENSED\b|No permission is granted/i.test(license)) {
  errors.push('Repository license is still UNLICENSED. Select and review an explicit license before public publication.');
}
try {
  await access(join(root, 'pnpm-lock.yaml'));
} catch (error) {
  if (error?.code === 'ENOENT') errors.push('pnpm-lock.yaml is missing. Generate, review, and commit the lockfile before publication.');
  else throw error;
}
for (const manifestPath of await listFiles(join(root, 'packages'), (path) => path.endsWith('/package.json'))) {
  const manifest = await readJson(manifestPath);
  const packageType = classifyPackageManifest(manifest);
  packageNames.add(manifest.name);

  if (packageType === 'unknown') {
    errors.push(`${manifest.name ?? manifestPath}: package directory is not part of the public or private tooling policy.`);
    continue;
  }

  if (packageType === 'public') {
    if (manifest.license === 'UNLICENSED') errors.push(`${manifest.name}: package license remains UNLICENSED.`);
    if (manifest.private === true) errors.push(`${manifest.name}: publishable package is marked private.`);
    continue;
  }

  if (manifest.private !== true) errors.push(`${manifest.name}: private tooling package must be marked private.`);
  if (manifest.publishConfig) errors.push(`${manifest.name}: private tooling package must not define publishConfig.`);
}
for (const packageName of [...PUBLIC_PACKAGE_NAMES, ...PRIVATE_TOOL_PACKAGE_NAMES]) {
  if (!packageNames.has(packageName)) errors.push(`${packageName}: package manifest is required by package policy.`);
}
for (const changesetPath of await listFiles(join(root, '.changeset'), (path) => path.endsWith('.md'))) {
  const changeset = await readFile(changesetPath, 'utf8');
  for (const packageName of PRIVATE_TOOL_PACKAGE_NAMES) {
    if (new RegExp(`^"${packageName}":`, 'm').test(changeset)) {
      errors.push(`${changesetPath}: private tooling package ${packageName} must not appear in Changeset frontmatter.`);
    }
  }
}
if (errors.length) {
  console.error(`Release readiness failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}
console.log(`Release readiness verified for ${PUBLIC_PACKAGE_NAMES.length} publishable packages and ${PRIVATE_TOOL_PACKAGE_NAMES.length} private tools.`);
