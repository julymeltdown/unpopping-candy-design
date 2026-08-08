import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { inspectCssContract } from './lib/css-contract.mjs';
import { listFiles, relativePath, repositoryRoot } from './lib/project-inspection.mjs';

const root = repositoryRoot();
const files = await listFiles(join(root, 'packages'), (path) => path.endsWith('.css'));
const errors = [];

for (const file of files) {
  const source = await readFile(file, 'utf8');
  errors.push(...inspectCssContract(source, relativePath(root, file)));
}

if (errors.length) {
  console.error([...new Set(errors)].join('\n'));
  process.exit(1);
}

console.log(`CSS namespace verified across ${files.length} files.`);
