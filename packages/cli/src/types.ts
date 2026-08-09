import type { KnowledgeCatalog, KnowledgeEntry, SearchResult } from '@commonspace/knowledge';
import type { ScaffoldInput, ScaffoldResult } from '@commonspace/registry';

export interface CommonspaceProjectInfo {
  root: string;
  packageManager: 'pnpm' | 'npm' | 'yarn' | 'bun' | 'unknown';
  framework: 'vite-react' | 'next-react' | 'react' | 'unknown';
  packageName: string | null;
  configPath: string | null;
  installed: Readonly<Record<string, string>>;
  sourceDirectories: readonly string[];
  styleImports: readonly string[];
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
  catalog: KnowledgeCatalog;
  projectInfo(startDirectory: string): Promise<CommonspaceProjectInfo>;
  validate(path: string): Promise<ValidationReport>;
  search(query: string, options?: { kind?: KnowledgeEntry['kind']; limit?: number }): readonly SearchResult[];
  get(idOrName: string): KnowledgeEntry | undefined;
  scaffold?(input: ScaffoldInput): Promise<ScaffoldResult>;
}

export type CliResult =
  | { ok: true; command: string; data: unknown }
  | { ok: false; command: string; error: { code: string; message: string; details?: unknown } };

export interface SearchResponse {
  query: string;
  catalogVersion: string;
  results: readonly SearchResult[];
}
