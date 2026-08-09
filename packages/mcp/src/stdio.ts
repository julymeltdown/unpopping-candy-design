#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createPopcandyMcpDomain } from './domain.ts';
import { createPopcandyMcpServer } from './server.ts';
import type { McpDomainServices } from './types.ts';

const knowledge = await import(import.meta.url.endsWith('.ts') ? '../../knowledge/src/index.ts' : '@unpopping-candy/knowledge');
const cli = await import(import.meta.url.endsWith('.ts') ? '../../cli/src/index.ts' : '@unpopping-candy/cli');
const registry = await import(import.meta.url.endsWith('.ts') ? '../../registry/src/index.ts' : '@unpopping-candy/registry');
const registryService = registry.createBundledRegistryService(knowledge.bundledCatalog);
const tokens = (await import('@unpopping-candy/tokens/tokens.json', { with: { type: 'json' } })).default as Record<string, unknown>;
const searchCatalog: McpDomainServices['search'] = (query, options) => knowledge.searchCatalog(knowledge.bundledCatalog, query, options);
const services: McpDomainServices = {
  catalog: knowledge.bundledCatalog,
  designMarkdown: knowledge.generateDesignMarkdown(knowledge.bundledCatalog, tokens),
  tokens,
  projectInfo: cli.detectPopcandyProject,
  validate: (path) => cli.validatePopcandyProject(knowledge.bundledCatalog, path),
  search: searchCatalog,
  get: (id) => knowledge.getCatalogEntry(knowledge.bundledCatalog, id),
  compose: (request) => cli.composeInterfacePlan(knowledge.bundledCatalog, request, searchCatalog),
  registryManifest: registryService.manifest,
  scaffold: registryService.scaffold,
};
const domain = createPopcandyMcpDomain(services);
const server = createPopcandyMcpServer(domain);
await server.connect(new StdioServerTransport());
