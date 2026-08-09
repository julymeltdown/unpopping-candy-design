import assert from 'node:assert/strict';
import test from 'node:test';
import { extractModuleSpecifiers } from '../../scripts/lib/project-inspection.mjs';
import { maskSource } from '../../scripts/lib/source-mask.mjs';

test('source masking keeps executable imports but removes generated code inside templates', () => {
  const source = `import type { Knowledge } from '@unpopping-candy/knowledge';\nconst generated = \`import figma from 'figma'\\nuseQuery()\`;\n`;
  const imports = extractModuleSpecifiers(maskSource(source));
  assert.deepEqual(imports, ['@unpopping-candy/knowledge']);
});

test('runtime masking removes identifiers that only occur in strings and comments', () => {
  const source = `const example = "useQuery()";\n// useSWR()\nfunction safe() { return true; }`;
  const runtime = maskSource(source, { maskQuotedStrings: true });
  assert.equal(/useQuery\b/.test(runtime), false);
  assert.equal(/useSWR\b/.test(runtime), false);
  assert.equal(/function\s+safe/.test(runtime), true);
});
