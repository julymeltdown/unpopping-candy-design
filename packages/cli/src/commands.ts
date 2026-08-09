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
    if (args[index] === name && args[index + 1]) output.push(args[index + 1] as string);
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
  const valueFlags = new Set(['--kind', '--limit', '--target', '--var']);
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

export async function executeCliCommand(services: CliServices, command: string, args: readonly string[], cwd = process.cwd()): Promise<CliResult> {
  try {
    switch (command) {
      case 'info': return { ok: true, command, data: { ...(await services.projectInfo(cwd)), catalogVersion: services.catalog.packageVersion } };
      case 'list': {
        const kind = optionalKind(option(args, '--kind'));
        const entries = services.catalog.entries.filter((entry) => !kind || entry.kind === kind).slice(0, boundedLimit(option(args, '--limit')));
        return { ok: true, command, data: { catalogVersion: services.catalog.packageVersion, entries } };
      }
      case 'get': {
        const target = positional(args).join(' ').trim();
        if (!target) throw new Error('get requires a component, pattern, template, or migration name.');
        const entry = services.get(target);
        if (!entry) return { ok: false, command, error: { code: 'NOT_FOUND', message: `No Unpopping Candy knowledge entry matched: ${target}` } };
        return { ok: true, command, data: entry };
      }
      case 'search': {
        const query = positional(args).join(' ').trim();
        if (!query) throw new Error('search requires a query.');
        const kind = optionalKind(option(args, '--kind'));
        const data: SearchResponse = {
          query,
          catalogVersion: services.catalog.packageVersion,
          results: services.search(query, {
            ...(kind ? { kind } : {}),
            limit: boundedLimit(option(args, '--limit')),
          }),
        };
        return { ok: true, command, data };
      }
      case 'compose': {
        const request = positional(args).join(' ').trim();
        return { ok: true, command, data: composeInterfacePlan(services.catalog, request, services.search) };
      }
      case 'validate': {
        const target = positional(args)[0] ?? cwd;
        const data = await services.validate(target);
        return data.summary.errors ? { ok: false, command, error: { code: 'VALIDATION_FAILED', message: `${data.summary.errors} Unpopping Candy validation errors found.`, details: data } } : { ok: true, command, data };
      }
      case 'doctor': {
        const info = await services.projectInfo(cwd);
        const report = await services.validate(info.root);
        const recommendations: string[] = [];
        for (const required of ['@unpopping-candy/tokens', '@unpopping-candy/theme', '@unpopping-candy/ui']) if (!info.installed[required]) recommendations.push(`Install ${required}.`);
        for (const stylesheet of ['@unpopping-candy/tokens/styles.css', '@unpopping-candy/icons/styles.css', '@unpopping-candy/ui/styles.css']) if (!info.styleImports.includes(stylesheet)) recommendations.push(`Import ${stylesheet} once at the application entry.`);
        if (!info.configPath) recommendations.push('Add popcandy.config.json for deterministic scaffolding and validation paths.');
        return { ok: report.summary.errors === 0, command, ...(report.summary.errors === 0 ? { data: { info, validation: report.summary, recommendations } } : { error: { code: 'DOCTOR_FAILED', message: 'Project has blocking Unpopping Candy issues.', details: { info, report, recommendations } } }) } as CliResult;
      }
      case 'scaffold': {
        if (!services.scaffold) return { ok: false, command, error: { code: 'REGISTRY_REQUIRED', message: 'Scaffolding requires @unpopping-candy/registry.' } };
        const templateId = positional(args)[0];
        if (!templateId) throw new Error('scaffold requires a template id.');
        if (args.includes('--apply') && args.includes('--dry-run')) throw new Error('Use either --apply or --dry-run, not both.');
        const data = await services.scaffold({
          templateId,
          projectRoot: cwd,
          targetDirectory: option(args, '--target') ?? '.',
          mode: args.includes('--apply') ? 'apply' : 'dry-run',
          variables: scaffoldVariables(options(args, '--var')),
        });
        return { ok: true, command, data };
      }
      default: return { ok: false, command, error: { code: 'UNKNOWN_COMMAND', message: `Unknown command: ${command || '(empty)'}`, details: { commands: ['info','list','get','search','compose','validate','doctor','scaffold'] } } };
    }
  } catch (error) {
    return { ok: false, command, error: { code: 'INVALID_INPUT', message: error instanceof Error ? error.message : String(error) } };
  }
}
