import { readFile, realpath } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import {
  bundledCatalog,
  bundledCompatibilityManifest,
  CatalogCompatibilityError,
  selectCatalogVersion,
} from '@unpopping-candy/knowledge';
import type { KnowledgeCatalog } from '@unpopping-candy/knowledge';
import { parseKnowledgeCatalog } from './catalog-schema.ts';
import { PopcandyProjectError } from './project-errors.ts';
import { detectPopcandyProject } from './project-info.ts';
import type { CatalogContext, ProjectCatalogContext } from './types.ts';

export const catalogsByVersion: Readonly<Record<string, KnowledgeCatalog>> = Object.freeze({
  [bundledCatalog.packageVersion]: bundledCatalog,
});

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isInside(root: string, target: string): boolean {
  const path = relative(root, target);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !isAbsolute(path));
}

async function configuredCatalog(context: ProjectCatalogContext): Promise<KnowledgeCatalog | undefined> {
  if (!context.project.configPath) return undefined;
  let configValue: unknown;
  try {
    configValue = JSON.parse(await readFile(context.project.configPath, 'utf8'));
  } catch (error) {
    throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `Unable to read ${context.project.configPath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!isRecord(configValue) || !('catalog' in configValue)) return undefined;
  if (configValue.schemaVersion !== 1) throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `${context.project.configPath} must declare schemaVersion 1 when catalog is configured.`);
  if (typeof configValue.catalog !== 'string' || !configValue.catalog.trim()) throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `catalog in ${context.project.configPath} must be a non-empty relative path.`);
  if (isAbsolute(configValue.catalog)) throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `catalog in ${context.project.configPath} must be relative to the project root.`);
  const root = await realpath(context.project.root);
  const candidate = resolve(root, configValue.catalog);
  if (!isInside(root, candidate)) throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `Configured catalog must stay inside ${root}.`);
  let catalogPath: string;
  try {
    catalogPath = await realpath(candidate);
  } catch (error) {
    throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `Configured catalog is unavailable at ${candidate}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!isInside(root, catalogPath)) throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `Configured catalog resolves outside ${root}.`);
  try {
    return parseKnowledgeCatalog(JSON.parse(await readFile(catalogPath, 'utf8')), catalogPath);
  } catch (error) {
    if (error instanceof PopcandyProjectError) throw error;
    throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `Configured catalog at ${catalogPath} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function resolveProjectCatalogContext(path: string): Promise<ProjectCatalogContext> {
  const project = await detectPopcandyProject(path);
  const empty: ProjectCatalogContext = { project, catalog: null, catalogVersion: null, catalogSource: null, diagnostics: [] };
  const configured = await configuredCatalog(empty);
  if (configured) return { project, catalog: configured, catalogVersion: configured.packageVersion, catalogSource: 'repository-config', diagnostics: [] };
  if (Object.keys(project.installed).length === 0) return {
    ...empty,
    diagnostics: [{ code: 'POPCANDY_DEPENDENCIES_NOT_INSTALLED', guidance: 'Install compatible Unpopping Candy packages or configure an explicit catalog.' }],
  };
  let version: string;
  try {
    version = selectCatalogVersion(bundledCompatibilityManifest, project.installed);
  } catch (error) {
    if (error instanceof CatalogCompatibilityError) throw new PopcandyProjectError(error.code, error.message);
    throw error;
  }
  const catalog = catalogsByVersion[version];
  if (!catalog) throw new PopcandyProjectError('POPCANDY_CATALOG_INCOMPATIBLE', `Compatible catalog ${version} is not bundled in this installation.`);
  return { project, catalog, catalogVersion: version, catalogSource: 'installed-set', diagnostics: [] };
}

export async function resolveCatalogContext(path: string): Promise<CatalogContext> {
  const context = await resolveProjectCatalogContext(path);
  if (!context.catalog || !context.catalogVersion || !context.catalogSource) {
    throw new PopcandyProjectError('POPCANDY_DEPENDENCIES_NOT_INSTALLED', context.diagnostics[0]?.guidance ?? 'No compatible catalog is available.');
  }
  return { ...context, catalog: context.catalog, catalogVersion: context.catalogVersion, catalogSource: context.catalogSource };
}
