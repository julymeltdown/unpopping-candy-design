import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import {
  extractRelativeMarkdownLinks,
  hasBalancedCodeFences,
} from './lib/markdown-contract.mjs';
import { listFiles, relativePath, repositoryRoot } from './lib/project-inspection.mjs';

const root = repositoryRoot();
const markdownFiles = [
  join(root, 'README.md'),
  join(root, 'DESIGN.md'),
  ...(await listFiles(join(root, 'docs'), (path) => path.endsWith('.md'))),
  ...(await listFiles(join(root, 'packages'), (path) => path.endsWith('README.md'))),
  ...(await listFiles(join(root, 'skills'), (path) => path.endsWith('.md'))),
  ...(await listFiles(join(root, 'agent/components'), (path) => path.endsWith('.md'))),
  ...(await listFiles(join(root, 'agent/patterns'), (path) => path.endsWith('.md'))),
];
const errors = [];

for (const file of [...new Set(markdownFiles)]) {
  const source = await readFile(file, 'utf8');
  const label = relativePath(root, file);

  if (!hasBalancedCodeFences(source)) {
    errors.push(`${label}: unbalanced fenced code block`);
  }

  for (const target of extractRelativeMarkdownLinks(source)) {
    const pathOnly = target.split('#')[0].split('?')[0];
    if (!pathOnly) continue;
    const resolved = resolve(dirname(file), decodeURIComponent(pathOnly));
    if (!resolved.startsWith(root)) {
      errors.push(`${label}: link escapes repository root: ${target}`);
      continue;
    }
    try {
      await access(resolved);
    } catch {
      errors.push(`${label}: missing relative link target ${target}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Documentation contracts verified across ${new Set(markdownFiles).size} Markdown files.`);
