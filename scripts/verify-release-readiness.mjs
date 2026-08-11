import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  classifyPackageManifest,
  isCanonicalPackageDirectory,
  PRIVATE_TOOL_PACKAGE_NAMES,
  PUBLIC_PACKAGE_NAMES,
} from './lib/public-packages.mjs';
import { parseChangesetFrontmatterPackageNames } from './lib/changeset-frontmatter.mjs';
import { listFiles, readJson, repositoryRoot } from './lib/project-inspection.mjs';

const root = repositoryRoot();
const errors = [];
const packageNameCounts = new Map();
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

  if (packageType === 'unknown') {
    errors.push(`${manifest.name ?? manifestPath}: package directory is not part of the public or private tooling policy.`);
    continue;
  }

  const manifestCount = (packageNameCounts.get(manifest.name) ?? 0) + 1;
  packageNameCounts.set(manifest.name, manifestCount);
  if (!isCanonicalPackageDirectory(dirname(manifestPath), manifest)) {
    errors.push(`${manifestPath}: package manifest must be in the canonical package directory for ${manifest.name}.`);
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
  const manifestCount = packageNameCounts.get(packageName) ?? 0;
  if (manifestCount === 0) errors.push(`${packageName}: package manifest is required by package policy.`);
  if (manifestCount > 1) errors.push(`${packageName}: package policy requires exactly one package manifest.`);
}
for (const changesetPath of await listFiles(join(root, '.changeset'), (path) => path.endsWith('.md'))) {
  const changeset = await readFile(changesetPath, 'utf8');
  for (const packageName of parseChangesetFrontmatterPackageNames(changeset)) {
    if (PRIVATE_TOOL_PACKAGE_NAMES.includes(packageName)) {
      errors.push(`${changesetPath}: private tooling package ${packageName} must not appear in Changeset frontmatter.`);
    }
  }
}
if (errors.length) {
  console.error(`Release readiness failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}
console.log(`Release readiness verified for ${PUBLIC_PACKAGE_NAMES.length} publishable packages and ${PRIVATE_TOOL_PACKAGE_NAMES.length} private tools.`);
