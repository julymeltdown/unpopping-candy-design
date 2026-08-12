import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { extractModuleSpecifiers, isSourceFile, listFiles, packageNameFromSpecifier, relativePath, repositoryRoot } from './lib/project-inspection.mjs';
import { maskSource } from './lib/source-mask.mjs';

const root = repositoryRoot();
const deterministicBans = [/\bfetch\s*\(/, /useQuery\b/, /useMutation\b/, /useSWR\b/, /zustand/, /react-router/, /Authorization\s*:/];
const rules = {
  tokens: { allowed: new Set(), bannedText: [...deterministicBans, /createStore\b/] },
  theme: { allowed: new Set(['react', '@unpopping-candy/tokens']), bannedText: deterministicBans },
  icons: { allowed: new Set(['react', '@ant-design/icons']), bannedText: deterministicBans },
  ui: { allowed: new Set(['react', '@unpopping-candy/icons', '@unpopping-candy/tokens']), bannedText: [...deterministicBans, /api-contract/, /auth-contract/] },
  social: { allowed: new Set(['react', '@unpopping-candy/icons', '@unpopping-candy/tokens', '@unpopping-candy/ui']), bannedText: [...deterministicBans, /api-contract/, /auth-contract/] },
  knowledge: { allowed: new Set(), bannedText: deterministicBans },
  registry: { allowed: new Set(['@unpopping-candy/knowledge']), bannedText: deterministicBans },
  cli: { allowed: new Set(['@unpopping-candy/knowledge', '@unpopping-candy/registry', 'yaml']), bannedText: deterministicBans },
  mcp: {
    allowed: new Set(['@unpopping-candy/cli', '@unpopping-candy/knowledge', '@unpopping-candy/registry', '@unpopping-candy/tokens', '@modelcontextprotocol/server', 'zod']),
    bannedText: [/useQuery\b/, /useMutation\b/, /useSWR\b/, /zustand/, /react-router/, /Authorization\s*:/],
  },
  evals: { allowed: new Set(['@unpopping-candy/knowledge']), bannedText: deterministicBans },
  figma: { allowed: new Set(['@unpopping-candy/knowledge']), bannedText: deterministicBans },
};
const errors = [];
for (const [packageDirectory, rule] of Object.entries(rules)) {
  const sourceRoot = join(root, 'packages', packageDirectory, 'src');
  const files = await listFiles(sourceRoot, isSourceFile);
  for (const file of files) {
    if (file.endsWith('.docs.ts')) continue;
    const source = await readFile(file, 'utf8');
    const importSource = maskSource(source);
    const runtimeSource = maskSource(source, { maskQuotedStrings: true });
    for (const specifier of extractModuleSpecifiers(importSource)) {
      if (specifier.includes('${')) continue;
      if (specifier.startsWith('.') || specifier.startsWith('node:')) continue;
      const packageName = packageNameFromSpecifier(specifier);
      if (!rule.allowed.has(packageName)) errors.push(`${relativePath(root, file)}: disallowed import ${specifier}`);
    }
    for (const pattern of rule.bannedText) {
      if (pattern.test(runtimeSource)) errors.push(`${relativePath(root, file)}: banned runtime pattern ${pattern}`);
    }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Package dependency boundaries verified.');
