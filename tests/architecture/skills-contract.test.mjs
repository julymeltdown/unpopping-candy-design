import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { inspectSkillDirectory, parseSkillMarkdown } from '../../scripts/lib/skills-contract.mjs';

test('skill parser reads required and nested metadata', () => {
  const parsed = parseSkillMarkdown(`---\nname: example-skill\ndescription: Use for examples.\nmetadata:\n  version: "1.2.3"\n---\n\n# Example\n`);
  assert.equal(parsed.frontmatter.name, 'example-skill');
  assert.equal(parsed.frontmatter.metadata.version, '1.2.3');
});

test('skill inspection rejects mismatched names and missing references', async () => {
  const root = await mkdtemp(join(tmpdir(), 'commonspace-skill-'));
  const skill = join(root, 'valid-name');
  await mkdir(join(skill, 'references'), { recursive: true });
  await writeFile(join(skill, 'SKILL.md'), `---\nname: wrong-name\ndescription: Use for a fixture.\nmetadata:\n  version: "1.0.0"\n---\n\n# Fixture\n\nRead [missing](references/missing.md).\n`);
  const result = await inspectSkillDirectory(skill);
  assert.ok(result.errors.some((error) => error.includes('match directory')));
  assert.ok(result.errors.some((error) => error.includes('missing reference')));
});
