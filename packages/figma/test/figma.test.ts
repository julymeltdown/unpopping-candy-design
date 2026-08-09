import assert from 'node:assert/strict';
import test from 'node:test';
import { bundledCatalog } from '../../knowledge/src/index.ts';
import {
  createFigmaManifest,
  generateCodeConnectTemplates,
  validateFigmaManifest,
} from '../src/index.ts';

const placeholderConfig = {
  schemaVersion: 1 as const,
  libraryName: 'Unpopping Candy',
  designFileUrl: 'https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy',
  mappings: {},
};

test('manifest covers every public component with deterministic template paths', () => {
  const manifest = createFigmaManifest(bundledCatalog, placeholderConfig);
  assert.equal(manifest.components.length, 32);
  assert.deepEqual(manifest.components.map((entry) => entry.componentId), [...manifest.components.map((entry) => entry.componentId)].sort());
  assert.equal(new Set(manifest.components.map((entry) => entry.templatePath)).size, 32);
  assert.ok(manifest.components.every((entry) => entry.status === 'placeholder'));
});

test('generated template files use public imports and parserless Code Connect format', () => {
  const manifest = createFigmaManifest(bundledCatalog, placeholderConfig);
  const files = generateCodeConnectTemplates(bundledCatalog, manifest);
  assert.equal(files.length, 32);
  const button = files.find((file) => file.path.endsWith('ui-button.figma.ts'));
  assert.ok(button);
  assert.match(button.content, /^\/\/ url=https:\/\/www\.figma\.com\/design\//);
  assert.match(button.content, /import figma from 'figma'/);
  assert.match(button.content, /import \{ Button \} from "@unpopping-candy\/ui\/button"/);
  assert.match(button.content, /figma\.code`/);
  assert.doesNotMatch(button.content, /@unpopping-candy\/ui\/src\//);
});

test('publish validation rejects placeholder nodes and accepts explicit Figma node URLs', () => {
  const placeholder = createFigmaManifest(bundledCatalog, placeholderConfig);
  assert.ok(validateFigmaManifest(placeholder, { allowPlaceholders: false }).some((issue) => issue.code === 'placeholder-node'));

  const ready = createFigmaManifest(bundledCatalog, {
    ...placeholderConfig,
    mappings: {
      'ui.button': { nodeUrl: 'https://www.figma.com/design/abc123/Unpopping-Candy?node-id=101-202' },
    },
  });
  const button = ready.components.find((entry) => entry.componentId === 'ui.button');
  assert.equal(button?.status, 'ready');
  assert.ok(validateFigmaManifest(ready, { allowPlaceholders: true }).every((issue) => issue.severity !== 'error'));
  assert.ok(validateFigmaManifest(ready, { allowPlaceholders: false }).some((issue) => issue.componentId !== 'ui.button'));
});
