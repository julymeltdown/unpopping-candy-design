import { McpServer, ResourceTemplate } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import type { CommonspaceMcpDomain } from './types.ts';

function toolResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }], structuredContent: data as Record<string, unknown> };
}

export function createCommonspaceMcpServer(domain: CommonspaceMcpDomain): McpServer {
  const server = new McpServer({ name: 'commonspace-ui', version: '0.2.0' });
  for (const resource of domain.listResources().filter((item) => !/^commonspace:\/\/(?:components|patterns|templates|migrations)\//.test(item.uri))) {
    server.registerResource(resource.name, resource.uri, { title: resource.name, description: resource.description, mimeType: resource.mimeType }, async (uri) => {
      const content = await domain.readResource(uri.href);
      return { contents: [{ uri: content.uri, mimeType: content.mimeType, text: content.text }] };
    });
  }
  for (const [plural, kind] of [['components','component'],['patterns','pattern'],['templates','template'],['migrations','migration']] as const) {
    server.registerResource(
      `commonspace-${plural}`,
      new ResourceTemplate(`commonspace://${plural}/{id}`, {
        list: async () => ({ resources: domain.listResources().filter((resource) => resource.uri.startsWith(`commonspace://${plural}/`)).map((resource) => ({ uri: resource.uri, name: resource.name, description: resource.description, mimeType: resource.mimeType })) }),
      }),
      { title: `Commonspace ${plural}`, description: `Read exact ${kind} metadata by stable id.`, mimeType: 'application/json' },
      async (uri) => {
        const content = await domain.readResource(uri.href);
        return { contents: [{ uri: content.uri, mimeType: content.mimeType, text: content.text }] };
      },
    );
  }
  server.registerTool('commonspace_project_info', { title: 'Commonspace project information', description: 'Detect framework, installed Commonspace versions, source roots, configuration, and required style imports.', inputSchema: z.object({ path: z.string().optional() }) }, async (input) => toolResult(await domain.projectInfo(input)));
  server.registerTool('commonspace_search', { title: 'Search Commonspace knowledge', description: 'Search components, patterns, templates, and migrations in the exact bundled catalog.', inputSchema: z.object({ query: z.string().min(1), kind: z.enum(['component','pattern','template','migration']).optional(), limit: z.number().int().min(1).max(20).optional() }) }, async (input) => toolResult(domain.search(input)));
  server.registerTool('commonspace_get', { title: 'Get Commonspace entry', description: 'Read complete guidance for one stable component, pattern, template, or migration id.', inputSchema: z.object({ id: z.string().min(1) }) }, async (input) => toolResult(domain.get(input)));
  server.registerTool('commonspace_compose', { title: 'Compose Commonspace interface', description: 'Convert a natural-language interface request into a bounded template, pattern, component, state, and validation plan.', inputSchema: z.object({ request: z.string().min(1) }) }, async (input) => toolResult(domain.compose(input)));
  server.registerTool('commonspace_validate', { title: 'Validate Commonspace usage', description: 'Read-only validation of imports, hardcoded visual values, and Commonspace package usage.', inputSchema: z.object({ path: z.string().optional() }) }, async (input) => toolResult(await domain.validate(input)));
  server.registerTool('commonspace_scaffold', { title: 'Scaffold a Commonspace template', description: 'Create a checksum-verified template plan. Dry-run is the default; files are written only when apply is explicitly true. Existing different files are never overwritten.', inputSchema: z.object({ templateId: z.string().min(1), path: z.string().optional(), targetDirectory: z.string().optional(), variables: z.record(z.string(), z.string()).optional(), apply: z.boolean().optional() }) }, async (input) => toolResult(await domain.scaffold(input)));
  for (const prompt of domain.listPrompts()) {
    server.registerPrompt(prompt.name, { title: prompt.title, description: prompt.description, argsSchema: z.object(Object.fromEntries(prompt.arguments.map((argument) => [argument.name, argument.required ? z.string().min(1) : z.string().optional()]))) }, (args) => {
      const result = domain.getPrompt(prompt.name, args as Record<string, string | undefined>);
      return { description: result.description, messages: [{ role: 'user', content: { type: 'text', text: result.text } }] };
    });
  }
  return server;
}
