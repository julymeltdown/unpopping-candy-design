#!/usr/bin/env node
import { executeCliCommand } from './commands.ts';
import { formatCliResult } from './format.ts';
import { detectCommonspaceProject } from './project-info.ts';
import { validateCommonspaceProject } from './validate.ts';

const knowledge = await import(import.meta.url.endsWith('.ts') ? '../../knowledge/src/index.ts' : '@commonspace/knowledge');
const args = process.argv.slice(2);
const command = args.shift() ?? '';
const json = args.includes('--json');
const result = await executeCliCommand({
  catalog: knowledge.bundledCatalog,
  projectInfo: detectCommonspaceProject,
  validate: (path) => validateCommonspaceProject(knowledge.bundledCatalog, path),
  search: (query, options) => knowledge.searchCatalog(knowledge.bundledCatalog, query, options),
  get: (idOrName) => knowledge.getCatalogEntry(knowledge.bundledCatalog, idOrName),
}, command, args);
process.stdout.write(formatCliResult(result, json));
if (!result.ok) process.exitCode = 1;
