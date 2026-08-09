import { createHash } from 'node:crypto';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseSkillMarkdown(source, label = 'SKILL.md') {
  if (!source.startsWith('---\n')) throw new Error(`${label}: missing YAML frontmatter`);
  const end = source.indexOf('\n---\n', 4);
  if (end < 0) throw new Error(`${label}: unterminated YAML frontmatter`);
  const frontmatterSource = source.slice(4, end);
  const body = source.slice(end + 5).trim();
  const frontmatter = {};
  let section = null;
  for (const rawLine of frontmatterSource.split('\n')) {
    if (!rawLine.trim()) continue;
    const nested = /^\s{2}([A-Za-z0-9_-]+):\s*(.*)$/.exec(rawLine);
    if (nested && section) {
      frontmatter[section] ??= {};
      frontmatter[section][nested[1]] = nested[2].replace(/^['"]|['"]$/g, '');
      continue;
    }
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(rawLine);
    if (!match) throw new Error(`${label}: unsupported frontmatter line: ${rawLine}`);
    section = match[1];
    frontmatter[section] = match[2] ? match[2].replace(/^['"]|['"]$/g, '') : {};
  }
  return { frontmatter, body };
}

function markdownTargets(source) {
  return [...source.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]).filter(Boolean);
}

async function listFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await listFiles(path));
    else output.push(path);
  }
  return output.sort((a, b) => a.localeCompare(b));
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

export async function inspectSkillDirectory(skillDirectory) {
  const name = skillDirectory.split(/[\\/]/).at(-1);
  const skillPath = join(skillDirectory, 'SKILL.md');
  const source = await readFile(skillPath, 'utf8');
  const { frontmatter, body } = parseSkillMarkdown(source, skillPath);
  const errors = [];
  if (!NAME_PATTERN.test(String(frontmatter.name ?? ''))) errors.push('name must use lowercase kebab-case');
  if (frontmatter.name !== name) errors.push(`frontmatter name must match directory ${name}`);
  const description = String(frontmatter.description ?? '').trim();
  if (!description) errors.push('description is required');
  if (description.length > 1024) errors.push('description must be at most 1024 characters');
  if (!body) errors.push('skill body is required');
  if (source.split('\n').length > 500) errors.push('SKILL.md must be at most 500 lines');
  if (/\b(?:TODO|TBD|FIXME)\b/.test(source)) errors.push('placeholders are not allowed');
  const references = [];
  for (const target of markdownTargets(body)) {
    if (/^[a-z]+:|^#/.test(target)) continue;
    const resolved = resolve(dirname(skillPath), target.split('#')[0]);
    if (!resolved.startsWith(resolve(skillDirectory))) errors.push(`link escapes skill directory: ${target}`);
    else if (!(await exists(resolved))) errors.push(`missing reference: ${target}`);
    else references.push(relative(skillDirectory, resolved));
  }
  const files = await listFiles(skillDirectory);
  for (const file of files) {
    const rel = relative(skillDirectory, file);
    if (rel.startsWith(`references/`) && rel.split(/[\\/]/).length > 2) errors.push(`reference nesting must be one level: ${rel}`);
    if (rel.startsWith(`scripts/`) && rel.split(/[\\/]/).length > 2) errors.push(`script nesting must be one level: ${rel}`);
  }
  const metadata = typeof frontmatter.metadata === 'object' ? frontmatter.metadata : {};
  return {
    errors,
    entry: {
      name,
      description,
      version: String(metadata.version ?? '0.0.0'),
      path: `skills/${name}/SKILL.md`,
      allowedTools: String(frontmatter['allowed-tools'] ?? '').split(/\s+/).filter(Boolean),
      references: [...new Set(references)].sort(),
      scripts: files.map((file) => relative(skillDirectory, file)).filter((path) => path.startsWith('scripts/')).sort(),
      sourceDigest: createHash('sha256').update(source).digest('hex'),
    },
  };
}

export async function inspectSkillsRoot(skillsRoot) {
  const directories = (await readdir(skillsRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => join(skillsRoot, entry.name)).sort();
  const inspections = await Promise.all(directories.map(inspectSkillDirectory));
  return {
    entries: inspections.map((inspection) => inspection.entry).sort((a, b) => a.name.localeCompare(b.name)),
    errors: inspections.flatMap((inspection) => inspection.errors.map((error) => `${inspection.entry.name}: ${error}`)),
  };
}
