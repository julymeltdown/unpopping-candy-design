import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { listFiles, readJson, repositoryRoot } from './lib/project-inspection.mjs';

const root = repositoryRoot();
const errors = [];
const license = await readFile(join(root, 'LICENSE.md'), 'utf8');
if (/\bUNLICENSED\b|No permission is granted/i.test(license)) {
  errors.push('Repository license is still UNLICENSED. Select and review an explicit license before public publication.');
}
try { await access(join(root, 'pnpm-lock.yaml')); } catch { errors.push('pnpm-lock.yaml is missing. Generate, review, and commit the lockfile before publication.'); }
for (const manifestPath of await listFiles(join(root, 'packages'), (path) => path.endsWith('/package.json'))) {
  const manifest = await readJson(manifestPath);
  if (manifest.license === 'UNLICENSED') errors.push(`${manifest.name}: package license remains UNLICENSED.`);
  if (manifest.private === true) errors.push(`${manifest.name}: publishable package is marked private.`);
}
if (errors.length) {
  console.error(`Release readiness failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}
console.log('Release readiness verified.');
