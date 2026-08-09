import { access, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const GENERATED_AT_KEYS = ['catalog', 'components', 'patterns', 'templates', 'migrations', 'registry', 'skills', 'stories', 'evals', 'figma'];

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function json(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

function countByKind(entries) {
  const counts = { component: 0, pattern: 0, template: 0, migration: 0 };
  for (const entry of entries) if (entry?.kind in counts) counts[entry.kind] += 1;
  return counts;
}

function validateComponent(entry, errors) {
  const label = entry?.id ?? '<unknown component>';
  for (const field of ['name', 'package', 'version', 'sourcePath', 'summary']) {
    if (typeof entry?.[field] !== 'string' || !entry[field].trim()) errors.push(`${label}: missing ${field}`);
  }
  for (const field of ['entrypoints', 'tokens', 'stories', 'props', 'states', 'useWhen', 'avoidWhen']) {
    if (!Array.isArray(entry?.[field])) errors.push(`${label}: ${field} must be an array`);
  }
  if (!entry?.entrypoints?.every((value) => typeof value === 'string' && value.startsWith('@commonspace/'))) {
    errors.push(`${label}: every entrypoint must be a public @commonspace import`);
  }
  if (!entry?.stories?.length) errors.push(`${label}: at least one Storybook contract is required`);
  if (!entry?.accessibility || !Array.isArray(entry.accessibility.requirements) || entry.accessibility.requirements.length === 0) {
    errors.push(`${label}: accessibility requirements are required`);
  }
  if (!entry?.examples || !Array.isArray(entry.examples.preferred) || entry.examples.preferred.length === 0) {
    errors.push(`${label}: at least one preferred example is required`);
  }
  for (const prop of entry?.props ?? []) {
    if (!prop || typeof prop.name !== 'string' || typeof prop.type !== 'string' || typeof prop.required !== 'boolean') {
      errors.push(`${label}: invalid public prop contract`);
    }
  }
}

export async function inspectAiContracts(rootDirectory) {
  const root = resolve(rootDirectory);
  const errors = [];
  const requiredFiles = [
    'AGENTS.md',
    'commonspace.config.json',
    'schemas/commonspace-config.schema.json',
    'DESIGN.md',
    'agent/llms.txt',
    'agent/llms-full.txt',
    'agent/manifests/catalog.json',
    'agent/manifests/registry.json',
    'agent/manifests/skills.json',
    'agent/manifests/stories.json',
    'agent/manifests/evals.json',
    'agent/manifests/figma.json',
  ];
  for (const relative of requiredFiles) if (!(await exists(join(root, relative)))) errors.push(`missing ${relative}`);
  if (errors.length) return { errors, counts: {} };

  const manifests = {};
  for (const key of GENERATED_AT_KEYS) manifests[key] = await json(join(root, `agent/manifests/${key}.json`));
  const catalog = manifests.catalog;
  const entries = Array.isArray(catalog.entries) ? catalog.entries : [];
  const counts = countByKind(entries);
  if (counts.component < 32) errors.push(`catalog: expected at least 32 components, found ${counts.component}`);
  if (counts.pattern < 6) errors.push(`catalog: expected at least 6 patterns, found ${counts.pattern}`);
  if (counts.template < 5) errors.push(`catalog: expected at least 5 templates, found ${counts.template}`);
  for (const component of entries.filter((entry) => entry.kind === 'component')) validateComponent(component, errors);

  const ids = entries.map((entry) => entry.id);
  if (new Set(ids).size !== ids.length) errors.push('catalog: duplicate stable ids');
  if ((manifests.components.entries ?? []).length !== counts.component) errors.push('components manifest count differs from catalog');
  if ((manifests.patterns.entries ?? []).length !== counts.pattern) errors.push('patterns manifest count differs from catalog');
  if ((manifests.templates.entries ?? []).length !== counts.template) errors.push('templates manifest count differs from catalog');
  if ((manifests.registry.templates ?? []).length !== counts.template) errors.push('registry template count differs from catalog');
  if ((manifests.stories.entries ?? []).length !== counts.component) errors.push('Storybook contract count differs from component count');
  if ((manifests.figma.components ?? []).length !== counts.component) errors.push('Figma mapping count differs from component count');
  if ((manifests.skills.entries ?? []).length < 6) errors.push('skills manifest must contain at least six focused Skills');
  if ((manifests.evals.scenarios ?? []).length < 6) errors.push('agent evaluation manifest must contain at least six reference scenarios');

  const generatedAt = new Set(GENERATED_AT_KEYS.map((key) => manifests[key]?.generatedAt).filter(Boolean));
  if (generatedAt.size !== 1) errors.push(`generated manifests must share one deterministic timestamp; found ${[...generatedAt].join(', ')}`);

  const config = await json(join(root, 'commonspace.config.json'));
  if (config.schemaVersion !== 1) errors.push('commonspace.config.json: schemaVersion must be 1');
  for (const relative of [config.catalog, config.design, config.registry, config.skills, config.evaluations, config.figma, ...Object.values(config.llms ?? {}), config.stories?.manifest]) {
    if (typeof relative !== 'string' || !relative.startsWith('./')) { errors.push(`commonspace.config.json: invalid local path ${String(relative)}`); continue; }
    if (!(await exists(join(root, relative)))) errors.push(`commonspace.config.json: missing configured path ${relative}`);
  }

  const mcpServerSource = await readFile(join(root, 'packages/mcp/src/server.ts'), 'utf8');
  const toolNames = [...mcpServerSource.matchAll(/registerTool\(\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
  if (toolNames.length === 0 || toolNames.length > 7) errors.push(`MCP tool surface must contain 1-7 general tools; found ${toolNames.length}`);
  if (new Set(toolNames).size !== toolNames.length) errors.push('MCP tool names must be unique');

  const evaluatorSource = await readFile(join(root, 'packages/evals/src/evaluator.ts'), 'utf8');
  if (evaluatorSource.includes('COMPONENT_PROP_HINTS')) errors.push('evaluator must use canonical prop contracts instead of a duplicate prop hint table');

  return {
    errors,
    counts: {
      ...counts,
      entries: entries.length,
      skills: manifests.skills.entries?.length ?? 0,
      stories: manifests.stories.entries?.length ?? 0,
      registryTemplates: manifests.registry.templates?.length ?? 0,
      evalScenarios: manifests.evals.scenarios?.length ?? 0,
      figmaMappings: manifests.figma.components?.length ?? 0,
      mcpTools: toolNames.length,
    },
  };
}
