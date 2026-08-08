import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { extractModuleSpecifiers, isSourceFile, listFiles, packageNameFromSpecifier, relativePath, repositoryRoot } from './lib/project-inspection.mjs';

const root = repositoryRoot();
const rules = {
  tokens: { allowed: new Set(), bannedText: [/\bfetch\s*\(/, /useQuery\b/, /useSWR\b/, /createStore\b/] },
  theme: { allowed: new Set(['react', '@commonspace/tokens']), bannedText: [/\bfetch\s*\(/, /useQuery\b/, /useSWR\b/, /zustand/] },
  icons: { allowed: new Set(['react', '@ant-design/icons']), bannedText: [/\bfetch\s*\(/, /useQuery\b/, /useSWR\b/, /zustand/] },
  ui: { allowed: new Set(['react', '@commonspace/icons', '@commonspace/tokens']), bannedText: [/\bfetch\s*\(/, /useQuery\b/, /useSWR\b/, /zustand/, /react-router/, /api-contract/, /auth-contract/] },
  social: { allowed: new Set(['react', '@commonspace/icons', '@commonspace/tokens', '@commonspace/ui']), bannedText: [/\bfetch\s*\(/, /useQuery\b/, /useMutation\b/, /useSWR\b/, /zustand/, /react-router/, /api-contract/, /auth-contract/, /Authorization\s*:/] },
};
const errors = [];
for (const [packageDirectory, rule] of Object.entries(rules)) {
  const sourceRoot = join(root, 'packages', packageDirectory, 'src');
  const files = await listFiles(sourceRoot, isSourceFile);
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    for (const specifier of extractModuleSpecifiers(source)) {
      if (specifier.startsWith('.') || specifier.startsWith('node:')) continue;
      const packageName = packageNameFromSpecifier(specifier);
      if (!rule.allowed.has(packageName)) errors.push(`${relativePath(root, file)}: disallowed import ${specifier}`);
    }
    for (const pattern of rule.bannedText) {
      if (pattern.test(source)) errors.push(`${relativePath(root, file)}: banned runtime pattern ${pattern}`);
    }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Package dependency boundaries verified.');
