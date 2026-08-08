import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractRelativeMarkdownLinks,
  hasBalancedCodeFences,
} from '../../scripts/lib/markdown-contract.mjs';

test('markdown contract extracts only repository-relative links', () => {
  const source = `
[architecture](./docs/ARCHITECTURE.md)
[section](#local)
[website](https://example.com)
[email](mailto:team@example.com)
![preview](./docs/preview/image.png "Preview")
`;

  assert.deepEqual(extractRelativeMarkdownLinks(source), [
    './docs/ARCHITECTURE.md',
    './docs/preview/image.png',
  ]);
});

test('markdown contract detects balanced fenced code blocks', () => {
  assert.equal(hasBalancedCodeFences('```ts\nconst ok = true;\n```\n'), true);
  assert.equal(hasBalancedCodeFences('```ts\nconst broken = true;\n'), false);
});
