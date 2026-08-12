#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createPopcandyMcpDomain } from './domain.ts';
import { createPopcandyMcpServer } from './server.ts';
import type { McpDomainServices } from './types.ts';

const knowledge = await import(import.meta.url.endsWith('.ts') ? '../../knowledge/src/index.ts' : '@unpopping-candy/knowledge');
const cli = await import(import.meta.url.endsWith('.ts') ? '../../cli/src/index.ts' : '@unpopping-candy/cli');
const registry = await import(import.meta.url.endsWith('.ts') ? '../../registry/src/index.ts' : '@unpopping-candy/registry');
const tokens: Record<string, unknown> = (await import('@unpopping-candy/tokens/tokens.json', { with: { type: 'json' } })).default;
const services: McpDomainServices = {
  catalog: knowledge.bundledCatalog,
  designMarkdown: (catalog) => knowledge.generateDesignMarkdown(catalog, tokens),
  tokens,
  projectContext: cli.resolveProjectCatalogContext,
  catalogContext: cli.resolveCatalogContext,
  validate: cli.validatePopcandyProject,
  registryManifest: (catalog) => registry.createBundledRegistryService(catalog).manifest(),
  scaffold: (catalog, input) => registry.createBundledRegistryService(catalog).scaffold(input),
};
const domain = createPopcandyMcpDomain(services);
const server = createPopcandyMcpServer(domain, { projectRoot: process.cwd() });
await server.connect(new StdioServerTransport());
