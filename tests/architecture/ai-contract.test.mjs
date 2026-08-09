import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { inspectAiContracts } from '../../scripts/lib/ai-contract.mjs';

const root = new URL('../..', import.meta.url).pathname;

test('repository AI contracts are internally consistent', async () => {
  const result = await inspectAiContracts(root);
  assert.deepEqual(result.errors, []);
  assert.equal(result.counts.component, 32);
  assert.equal(result.counts.stories, 32);
  assert.equal(result.counts.figmaMappings, 32);
  assert.equal(result.counts.registryTemplates, 5);
  assert.ok(result.counts.mcpTools <= 7);
});

test('AI contract inspection fails closed when generated context is missing', async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'popcandy-ai-contract-'));
  await mkdir(join(fixture, 'agent/manifests'), { recursive: true });
  await writeFile(join(fixture, 'AGENTS.md'), '# Fixture\n');
  const result = await inspectAiContracts(fixture);
  assert.ok(result.errors.some((error) => error.includes('popcandy.config.json')));
  assert.ok(result.errors.some((error) => error.includes('catalog.json')));
});
