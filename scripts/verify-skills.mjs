import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectSkillsRoot } from './lib/skills-contract.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const write = process.argv.includes('--write');
const result = await inspectSkillsRoot(join(root, 'skills'));
if (result.errors.length) {
  console.error(`Skill contracts failed:\n${result.errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}
const manifest = `${JSON.stringify({ schemaVersion: 1, generatedAt: '2026-08-09T00:00:00.000Z', entries: result.entries }, null, 2)}\n`;
const outputPath = join(root, 'agent/manifests/skills.json');
let current = null;
try { current = await readFile(outputPath, 'utf8'); } catch {}
if (current !== manifest) {
  if (checkOnly) {
    console.error('Skill manifest is stale: agent/manifests/skills.json');
    process.exit(1);
  }
  if (write) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, manifest, 'utf8');
  }
}
console.log(`${checkOnly ? 'Verified' : 'Inspected'} ${result.entries.length} Agent Skills.`);
