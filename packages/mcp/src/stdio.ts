#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createCommonspaceMcpDomain } from './domain.ts';
import { createCommonspaceMcpServer } from './server.ts';

const knowledge = await import(import.meta.url.endsWith('.ts') ? '../../knowledge/src/index.ts' : '@commonspace/knowledge');
const cli = await import(import.meta.url.endsWith('.ts') ? '../../cli/src/index.ts' : '@commonspace/cli');
const tokens = (await import('@commonspace/tokens/tokens.json', { with: { type: 'json' } })).default as Record<string, unknown>;
const domain = createCommonspaceMcpDomain({
  catalog: knowledge.bundledCatalog,
  designMarkdown: knowledge.generateDesignMarkdown(knowledge.bundledCatalog, tokens),
  tokens,
  projectInfo: cli.detectCommonspaceProject,
  validate: (path) => cli.validateCommonspaceProject(knowledge.bundledCatalog, path),
  search: (query, options) => knowledge.searchCatalog(knowledge.bundledCatalog, query, options),
  get: (id) => knowledge.getCatalogEntry(knowledge.bundledCatalog, id),
  compose: (request) => cli.composeInterfacePlan(knowledge.bundledCatalog, request, (query, options) => knowledge.searchCatalog(knowledge.bundledCatalog, query, options)),
});
const server = createCommonspaceMcpServer(domain);
await server.connect(new StdioServerTransport());
