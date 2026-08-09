import type { KnowledgeEntry } from '@commonspace/knowledge';
import type { CommonspaceMcpDomain, McpDomainServices, McpPromptDefinition, McpResourceContent, McpResourceDescriptor } from './types.ts';

const BASE_RESOURCES: readonly McpResourceDescriptor[] = [
  { uri: 'commonspace://design/current', name: 'Current design contract', description: 'Generated portable Commonspace DESIGN.md.', mimeType: 'text/markdown' },
  { uri: 'commonspace://catalog', name: 'Knowledge catalog', description: 'Versioned component, pattern, template, and migration metadata.', mimeType: 'application/json' },
  { uri: 'commonspace://tokens', name: 'Design tokens', description: 'DTCG-compatible Commonspace token source.', mimeType: 'application/json' },
  { uri: 'commonspace://registry', name: 'Registry manifest', description: 'Versioned templates, files, variables, and checksums available for guarded scaffolding.', mimeType: 'application/json' },
  { uri: 'commonspace://project/info', name: 'Project information', description: 'Detected project framework, Commonspace versions, and style setup.', mimeType: 'application/json' },
];

const PROMPTS: readonly McpPromptDefinition[] = [
  { name: 'build-interface', title: 'Build a Commonspace interface', description: 'Plan and implement a state-complete interface using exact Commonspace catalog entries.', arguments: [{ name: 'task', required: true, description: 'The user-facing workflow or page to build.' }, { name: 'path', required: false, description: 'Target project path.' }] },
  { name: 'migrate-interface', title: 'Migrate an interface', description: 'Plan a route-by-route migration that preserves application behavior.', arguments: [{ name: 'task', required: true, description: 'Existing interface and migration goal.' }, { name: 'path', required: false, description: 'Target project path.' }] },
  { name: 'review-interface', title: 'Review a Commonspace interface', description: 'Review component reuse, tokens, states, accessibility, and boundaries.', arguments: [{ name: 'task', required: true, description: 'Surface or change to review.' }, { name: 'path', required: false, description: 'Target project path.' }] },
  { name: 'author-component', title: 'Author a Commonspace component', description: 'Define and verify a public component, metadata, stories, tests, and release impact.', arguments: [{ name: 'task', required: true, description: 'Reusable responsibility to add or change.' }] },
];

function boundedLimit(value: number | undefined, maximum = 20): number {
  return Number.isInteger(value) ? Math.max(1, Math.min(value ?? maximum, maximum)) : maximum;
}

function jsonResource(descriptor: McpResourceDescriptor, value: unknown): McpResourceContent {
  return { ...descriptor, text: `${JSON.stringify(value, null, 2)}\n` };
}

function entryDescriptor(entry: KnowledgeEntry): McpResourceDescriptor {
  const plural = entry.kind === 'component' ? 'components' : entry.kind === 'pattern' ? 'patterns' : entry.kind === 'template' ? 'templates' : 'migrations';
  return { uri: `commonspace://${plural}/${entry.id}`, name: entry.name, description: entry.summary, mimeType: 'application/json' };
}

function parseEntryUri(uri: string): { kind: KnowledgeEntry['kind']; id: string } | null {
  const parsed = new URL(uri);
  if (parsed.protocol !== 'commonspace:') return null;
  const kindMap: Record<string, KnowledgeEntry['kind'] | undefined> = { components: 'component', patterns: 'pattern', templates: 'template', migrations: 'migration' };
  const kind = kindMap[parsed.hostname];
  const id = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  return kind && id ? { kind, id } : null;
}

export function createCommonspaceMcpDomain(services: McpDomainServices): CommonspaceMcpDomain {
  const entryResources = services.catalog.entries.map(entryDescriptor);
  return {
    listResources: () => [...BASE_RESOURCES, ...entryResources],
    async readResource(uri, projectPath = process.cwd()) {
      const base = BASE_RESOURCES.find((resource) => resource.uri === uri);
      if (base?.uri === 'commonspace://design/current') return { ...base, text: services.designMarkdown };
      if (base?.uri === 'commonspace://catalog') return jsonResource(base, services.catalog);
      if (base?.uri === 'commonspace://tokens') return jsonResource(base, services.tokens);
      if (base?.uri === 'commonspace://registry') return jsonResource(base, await services.registryManifest());
      if (base?.uri === 'commonspace://project/info') return jsonResource(base, await services.projectInfo(projectPath));
      const parsed = parseEntryUri(uri);
      if (!parsed) throw new Error(`Unsupported Commonspace resource URI: ${uri}`);
      const entry = services.get(parsed.id);
      if (!entry || entry.kind !== parsed.kind) throw new Error(`Commonspace resource not found: ${uri}`);
      return jsonResource(entryDescriptor(entry), entry);
    },
    async projectInfo(input) { return { catalogVersion: services.catalog.packageVersion, project: await services.projectInfo(input.path ?? process.cwd()) }; },
    search(input) {
      if (!input.query.trim()) throw new Error('query is required');
      return { query: input.query.trim(), catalogVersion: services.catalog.packageVersion, results: services.search(input.query, { kind: input.kind, limit: boundedLimit(input.limit) }) };
    },
    get(input) {
      const entry = services.get(input.id);
      if (!entry) throw new Error(`Commonspace knowledge entry not found: ${input.id}`);
      return { catalogVersion: services.catalog.packageVersion, entry };
    },
    compose(input) {
      if (!input.request.trim()) throw new Error('request is required');
      return services.compose(input.request.trim());
    },
    async validate(input) { return services.validate(input.path ?? process.cwd()); },
    async scaffold(input) {
      if (!input.templateId.trim()) throw new Error('templateId is required');
      return services.scaffold({
        templateId: input.templateId.trim(),
        projectRoot: input.path ?? process.cwd(),
        targetDirectory: input.targetDirectory ?? '.',
        variables: input.variables ?? {},
        mode: input.apply === true ? 'apply' : 'dry-run',
      });
    },
    listPrompts: () => PROMPTS,
    getPrompt(name, args) {
      const prompt = PROMPTS.find((item) => item.name === name);
      if (!prompt) throw new Error(`Unknown Commonspace prompt: ${name}`);
      const task = args.task?.trim();
      if (!task) throw new Error(`${name} requires task`);
      const path = args.path?.trim() || '.';
      const workflows: Record<McpPromptDefinition['name'], string> = {
        'build-interface': `Build this interface with Commonspace UI: ${task}`,
        'migrate-interface': `Migrate this interface to Commonspace UI without changing business behavior: ${task}`,
        'review-interface': `Review this interface against Commonspace UI contracts: ${task}`,
        'author-component': `Author or change a public Commonspace component for this responsibility: ${task}`,
      };
      return {
        description: prompt.description,
        text: `${workflows[name]}\n\nTarget path: ${path}\n\nRequired sequence:\n1. Read commonspace://project/info.\n2. Call commonspace_search and commonspace_compose before writing code.\n3. Inspect selected entries with commonspace_get.\n4. Use public imports and consumer-owned state.\n5. Create or update Storybook stories.\n6. Call commonspace_validate and run Storybook interaction and accessibility checks.`,
      };
    },
  };
}
