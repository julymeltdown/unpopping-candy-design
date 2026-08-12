import { getCatalogEntry, searchCatalog, searchCatalogDetailed } from '@unpopping-candy/knowledge';
import type { KnowledgeEntry } from '@unpopping-candy/knowledge';
import { composeInterfacePlan } from './compose.ts';
import type { CliResult, CliServices, SearchResponse } from './types.ts';

function option(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function options(args: readonly string[], name: string): string[] {
  const output: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === name && args[index + 1]) output.push(args[index + 1] ?? '');
  }
  return output;
}

function scaffoldVariables(values: readonly string[]): Readonly<Record<string, string>> {
  const output: Record<string, string> = {};
  for (const value of values) {
    const separator = value.indexOf('=');
    if (separator <= 0) throw new Error(`Invalid --var value: ${value}. Expected name=value.`);
    const name = value.slice(0, separator).trim();
    const variableValue = value.slice(separator + 1);
    if (!name || name in output) throw new Error(`Duplicate or empty scaffold variable: ${name || '(empty)'}`);
    output[name] = variableValue;
  }
  return output;
}

function positional(args: readonly string[]): string[] {
  const output: string[] = [];
  const valueFlags = new Set(['--kind', '--limit', '--path', '--target', '--var']);
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value?.startsWith('--')) { if (valueFlags.has(value)) index += 1; continue; }
    if (value) output.push(value);
  }
  return output;
}

function optionalKind(value: string | undefined): KnowledgeEntry['kind'] | undefined {
  if (value === undefined) return undefined;
  if (value === 'component' || value === 'pattern' || value === 'template' || value === 'migration') return value;
  throw new Error(`Invalid knowledge kind: ${value}`);
}

function boundedLimit(value: string | undefined): number {
  const parsed = Number(value ?? 20);
  return Number.isInteger(parsed) ? Math.max(1, Math.min(parsed, 50)) : 20;
}

function errorCode(error: unknown): string {
  return error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : 'INVALID_INPUT';
}

export async function executeCliCommand(services: CliServices, command: string, args: readonly string[], cwd = process.cwd()): Promise<CliResult> {
  try {
    const targetPath = option(args, '--path') ?? cwd;
    switch (command) {
      case 'info': {
        const context = await services.projectContext(targetPath);
        return { ok: true, command, data: { ...context.project, catalogVersion: context.catalogVersion, catalogSource: context.catalogSource, diagnostics: context.diagnostics } };
      }
      case 'list': {
        const context = await services.catalogContext(targetPath);
        const kind = optionalKind(option(args, '--kind'));
        const entries = context.catalog.entries.filter((entry) => !kind || entry.kind === kind).slice(0, boundedLimit(option(args, '--limit')));
        return { ok: true, command, data: { catalogVersion: context.catalogVersion, catalogSource: context.catalogSource, entries } };
      }
      case 'get': {
        const context = await services.catalogContext(targetPath);
        const target = positional(args).join(' ').trim();
        if (!target) throw new Error('get requires a component, pattern, template, or migration name.');
        const entry = getCatalogEntry(context.catalog, target);
        if (!entry) return { ok: false, command, error: { code: 'NOT_FOUND', message: `No Unpopping Candy knowledge entry matched: ${target}` } };
        return { ok: true, command, data: { catalogVersion: context.catalogVersion, catalogSource: context.catalogSource, entry } };
      }
      case 'search': {
        const context = await services.catalogContext(targetPath);
        const query = positional(args).join(' ').trim();
        if (!query) throw new Error('search requires a query.');
        const kind = optionalKind(option(args, '--kind'));
        const detailed = searchCatalogDetailed(context.catalog, query, { ...(kind ? { kind } : {}), limit: boundedLimit(option(args, '--limit')) });
        const data: SearchResponse = { query, catalogVersion: context.catalogVersion, catalogSource: context.catalogSource, ...detailed };
        return { ok: true, command, data };
      }
      case 'compose': {
        const context = await services.catalogContext(targetPath);
        const request = positional(args).join(' ').trim();
        return { ok: true, command, data: { catalogSource: context.catalogSource, ...composeInterfacePlan(context.catalog, request, (query, searchOptions) => searchCatalog(context.catalog, query, searchOptions)) } };
      }
      case 'validate': {
        const context = await services.catalogContext(targetPath);
        const data = await services.validate(context.catalog, context.project.root);
        return data.summary.errors ? { ok: false, command, error: { code: 'VALIDATION_FAILED', message: `${data.summary.errors} Unpopping Candy validation errors found.`, details: data } } : { ok: true, command, data: { catalogVersion: context.catalogVersion, catalogSource: context.catalogSource, ...data } };
      }
      case 'doctor': {
        const context = await services.projectContext(targetPath);
        const report = context.catalog ? await services.validate(context.catalog, context.project.root) : { root: context.project.root, filesScanned: 0, issues: [], summary: { errors: 0, warnings: 0 } };
        const recommendations: string[] = [];
        for (const required of ['@unpopping-candy/tokens', '@unpopping-candy/theme', '@unpopping-candy/ui']) if (!context.project.installed[required]) recommendations.push(`Install ${required}.`);
        if (!context.project.configPath) recommendations.push('Add popcandy.config.json for deterministic scaffolding and validation paths.');
        return { ok: true, command, data: { info: context.project, validation: report.summary, recommendations } };
      }
      case 'scaffold': {
        if (!services.scaffold) return { ok: false, command, error: { code: 'REGISTRY_REQUIRED', message: 'Scaffolding requires @unpopping-candy/registry.' } };
        const context = await services.catalogContext(targetPath);
        const templateId = positional(args)[0];
        if (!templateId) throw new Error('scaffold requires a template id.');
        if (!getCatalogEntry(context.catalog, templateId)) return { ok: false, command, error: { code: 'POPCANDY_CATALOG_INCOMPATIBLE', message: `Template ${templateId} is unavailable in catalog ${context.catalogVersion}.` } };
        if (args.includes('--apply') && args.includes('--dry-run')) throw new Error('Use either --apply or --dry-run, not both.');
        const data = await services.scaffold({ templateId, projectRoot: context.project.root, targetDirectory: option(args, '--target') ?? '.', mode: args.includes('--apply') ? 'apply' : 'dry-run', variables: scaffoldVariables(options(args, '--var')) });
        return { ok: true, command, data };
      }
      default: return { ok: false, command, error: { code: 'UNKNOWN_COMMAND', message: `Unknown command: ${command || '(empty)'}` } };
    }
  } catch (error) {
    return { ok: false, command, error: { code: errorCode(error), message: error instanceof Error ? error.message : String(error) } };
  }
}
