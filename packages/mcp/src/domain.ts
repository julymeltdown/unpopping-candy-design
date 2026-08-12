import { getCatalogEntry, searchCatalog, searchCatalogDetailed } from '@unpopping-candy/knowledge';
import type { KnowledgeEntry } from '@unpopping-candy/knowledge';
import { composeInterfacePlan } from '@unpopping-candy/cli';
import type { PopcandyMcpDomain, McpDomainServices, McpPromptDefinition, McpResourceContent, McpResourceDescriptor } from './types.ts';

const BASE_RESOURCES: readonly McpResourceDescriptor[] = [
  { uri: 'popcandy://design/current', name: 'Current design contract', description: 'Generated portable Unpopping Candy DESIGN.md.', mimeType: 'text/markdown' },
  { uri: 'popcandy://catalog', name: 'Knowledge catalog', description: 'Versioned component, pattern, template, and migration metadata.', mimeType: 'application/json' },
  { uri: 'popcandy://tokens', name: 'Design tokens', description: 'DTCG-compatible Unpopping Candy token source.', mimeType: 'application/json' },
  { uri: 'popcandy://registry', name: 'Registry manifest', description: 'Versioned templates, files, variables, and checksums available for guarded scaffolding.', mimeType: 'application/json' },
  { uri: 'popcandy://project/info', name: 'Project information', description: 'Detected project framework, Unpopping Candy versions, and style setup.', mimeType: 'application/json' },
];

const PROMPTS: readonly McpPromptDefinition[] = [
  { name: 'build-interface', title: 'Build a Unpopping Candy interface', description: 'Plan and implement a state-complete interface using exact Unpopping Candy catalog entries.', arguments: [{ name: 'task', required: true, description: 'The user-facing workflow or page to build.' }, { name: 'path', required: false, description: 'Target project path.' }] },
  { name: 'migrate-interface', title: 'Migrate an interface', description: 'Plan a route-by-route migration that preserves application behavior.', arguments: [{ name: 'task', required: true, description: 'Existing interface and migration goal.' }, { name: 'path', required: false, description: 'Target project path.' }] },
  { name: 'review-interface', title: 'Review a Unpopping Candy interface', description: 'Review component reuse, tokens, states, accessibility, and boundaries.', arguments: [{ name: 'task', required: true, description: 'Surface or change to review.' }, { name: 'path', required: false, description: 'Target project path.' }] },
  { name: 'author-component', title: 'Author a Unpopping Candy component', description: 'Define and verify a public component, metadata, stories, tests, and release impact.', arguments: [{ name: 'task', required: true, description: 'Reusable responsibility to add or change.' }] },
];

function boundedLimit(value: number | undefined): number {
  return Number.isInteger(value) ? Math.max(1, Math.min(value ?? 20, 20)) : 20;
}

function jsonResource(descriptor: McpResourceDescriptor, value: unknown): McpResourceContent {
  return { ...descriptor, text: `${JSON.stringify(value, null, 2)}\n` };
}

function entryDescriptor(entry: KnowledgeEntry): McpResourceDescriptor {
  const plural = entry.kind === 'component' ? 'components' : entry.kind === 'pattern' ? 'patterns' : entry.kind === 'template' ? 'templates' : 'migrations';
  return { uri: `popcandy://${plural}/${entry.id}`, name: entry.name, description: entry.summary, mimeType: 'application/json' };
}

function parseEntryUri(uri: string): { kind: KnowledgeEntry['kind']; id: string } | null {
  const parsed = new URL(uri);
  if (parsed.protocol !== 'popcandy:') return null;
  const kindMap: Record<string, KnowledgeEntry['kind'] | undefined> = { components: 'component', patterns: 'pattern', templates: 'template', migrations: 'migration' };
  const kind = kindMap[parsed.hostname];
  const id = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  return kind && id ? { kind, id } : null;
}

export function createPopcandyMcpDomain(services: McpDomainServices): PopcandyMcpDomain {
  const entryResources = services.catalog.entries.map(entryDescriptor);
  return {
    listResources: () => [...BASE_RESOURCES, ...entryResources],
    async readResource(uri, projectPath = process.cwd()) {
      const base = BASE_RESOURCES.find((resource) => resource.uri === uri);
      if (base?.uri === 'popcandy://tokens') return jsonResource(base, services.tokens);
      if (base?.uri === 'popcandy://project/info') return jsonResource(base, await services.projectContext(projectPath));
      const context = await services.catalogContext(projectPath);
      if (base?.uri === 'popcandy://registry') return jsonResource(base, await services.registryManifest(context.catalog));
      if (base?.uri === 'popcandy://design/current') return { ...base, text: services.designMarkdown(context.catalog) };
      if (base?.uri === 'popcandy://catalog') return jsonResource(base, { catalogVersion: context.catalogVersion, catalog: context.catalog });
      const parsed = parseEntryUri(uri);
      if (!parsed) throw new Error(`Unsupported Unpopping Candy resource URI: ${uri}`);
      const entry = getCatalogEntry(context.catalog, parsed.id);
      if (!entry || entry.kind !== parsed.kind) throw new Error(`Unpopping Candy resource not found: ${uri}`);
      return jsonResource(entryDescriptor(entry), { catalogVersion: context.catalogVersion, entry });
    },
    async projectInfo(input) {
      const context = await services.projectContext(input.path ?? process.cwd());
      return { catalogVersion: context.catalogVersion, catalogSource: context.catalogSource, diagnostics: context.diagnostics, project: context.project };
    },
    async search(input) {
      if (!input.query.trim()) throw new Error('query is required');
      const context = await services.catalogContext(input.path ?? process.cwd());
      return { query: input.query.trim(), catalogVersion: context.catalogVersion, catalogSource: context.catalogSource, ...searchCatalogDetailed(context.catalog, input.query, { ...(input.kind ? { kind: input.kind } : {}), limit: boundedLimit(input.limit) }) };
    },
    async get(input) {
      const context = await services.catalogContext(input.path ?? process.cwd());
      const entry = getCatalogEntry(context.catalog, input.id);
      if (!entry) throw new Error(`Unpopping Candy knowledge entry not found: ${input.id}`);
      return { catalogVersion: context.catalogVersion, catalogSource: context.catalogSource, entry };
    },
    async compose(input) {
      if (!input.request.trim()) throw new Error('request is required');
      const context = await services.catalogContext(input.path ?? process.cwd());
      return { catalogSource: context.catalogSource, ...composeInterfacePlan(context.catalog, input.request.trim(), (query, options) => searchCatalog(context.catalog, query, options)) };
    },
    async validate(input) {
      const context = await services.catalogContext(input.path ?? process.cwd());
      return { catalogVersion: context.catalogVersion, catalogSource: context.catalogSource, ...await services.validate(context.catalog, context.project.root) };
    },
    async scaffold(input) {
      if (!input.templateId.trim()) throw new Error('templateId is required');
      const context = await services.catalogContext(input.path ?? process.cwd());
      const entry = getCatalogEntry(context.catalog, input.templateId.trim());
      if (!entry || entry.kind !== 'template') throw new Error(`Template ${input.templateId} is incompatible with catalog ${context.catalogVersion}.`);
      return services.scaffold(context.catalog, { templateId: entry.id, projectRoot: context.project.root, targetDirectory: input.targetDirectory ?? '.', variables: input.variables ?? {}, mode: input.apply === true ? 'apply' : 'dry-run' });
    },
    listPrompts: () => PROMPTS,
    getPrompt(name, args) {
      const prompt = PROMPTS.find((item) => item.name === name);
      if (!prompt) throw new Error(`Unknown Unpopping Candy prompt: ${name}`);
      const task = args.task?.trim();
      if (!task) throw new Error(`${name} requires task`);
      const path = args.path?.trim() || '.';
      const workflows: Record<McpPromptDefinition['name'], string> = {
        'build-interface': `Build this interface with Unpopping Candy: ${task}`,
        'migrate-interface': `Migrate this interface to Unpopping Candy without changing business behavior: ${task}`,
        'review-interface': `Review this interface against Unpopping Candy contracts: ${task}`,
        'author-component': `Author or change a public Unpopping Candy component for this responsibility: ${task}`,
      };
      return { description: prompt.description, text: `${workflows[name]}\n\nTarget path: ${path}\n\nRequired sequence:\n1. Read popcandy://project/info.\n2. Call popcandy_search and popcandy_compose before writing code.\n3. Inspect selected entries with popcandy_get.\n4. Use public imports and consumer-owned state.\n5. Create or update Storybook stories.\n6. Call popcandy_validate and run Storybook interaction and accessibility checks.` };
    },
  };
}
