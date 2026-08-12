import type { KnowledgeCatalog, KnowledgeEntry, SearchResult } from '@unpopping-candy/knowledge';
import type { ScaffoldInput, ScaffoldResult } from '@unpopping-candy/registry';
import type { VersionResolutionSource } from './version-resolution.ts';

export interface PopcandyProjectInfo {
  root: string;
  packageManager: 'pnpm' | 'npm' | 'yarn' | 'bun' | 'unknown';
  framework: 'vite-react' | 'next-react' | 'react' | 'unknown';
  packageName: string | null;
  configPath: string | null;
  installed: Readonly<Record<string, string>>;
  versionResolutionSource: VersionResolutionSource;
  sourceDirectories: readonly string[];
  styleImports: readonly string[];
}

export interface CatalogContextDiagnostic {
  readonly code: 'POPCANDY_DEPENDENCIES_NOT_INSTALLED';
  readonly guidance: string;
}

export interface ProjectCatalogContext {
  readonly project: PopcandyProjectInfo;
  readonly catalog: KnowledgeCatalog | null;
  readonly catalogVersion: string | null;
  readonly catalogSource: 'installed-set' | 'repository-config' | null;
  readonly diagnostics: readonly CatalogContextDiagnostic[];
}

export interface CatalogContext extends ProjectCatalogContext {
  readonly catalog: KnowledgeCatalog;
  readonly catalogVersion: string;
  readonly catalogSource: 'installed-set' | 'repository-config';
}

export interface ValidationIssue {
  code: string;
  severity: 'error' | 'warning';
  file?: string;
  line?: number;
  message: string;
  guidance?: string;
}

export interface ValidationReport {
  root: string;
  filesScanned: number;
  issues: readonly ValidationIssue[];
  summary: { errors: number; warnings: number };
}

export interface CompositionPlan {
  request: string;
  catalogVersion: string;
  template: KnowledgeEntry | null;
  patterns: readonly KnowledgeEntry[];
  components: readonly KnowledgeEntry[];
  imports: readonly string[];
  steps: readonly { phase: string; action: string; references: readonly string[] }[];
  validation: readonly string[];
}

export interface CliServices {
  projectContext(startDirectory: string): Promise<ProjectCatalogContext>;
  catalogContext(startDirectory: string): Promise<CatalogContext>;
  validate(catalog: KnowledgeCatalog, path: string): Promise<ValidationReport>;
  scaffold?(input: ScaffoldInput): Promise<ScaffoldResult>;
}

export type CliResult =
  | { ok: true; command: string; data: unknown }
  | { ok: false; command: string; error: { code: string; message: string; details?: unknown } };

export interface SearchResponse {
  readonly query: string;
  readonly catalogVersion: string;
  readonly catalogSource: CatalogContext['catalogSource'];
  readonly results: readonly SearchResult[];
  readonly benchmark: {
    readonly scanned: number;
    readonly eligible: number;
    readonly returned: number;
    readonly omittedDeprecated: number;
    readonly omittedIncompatible: number;
  };
  readonly diagnostics: readonly { readonly code: string; readonly entryId?: string; readonly count?: number; readonly guidance: string }[];
}
