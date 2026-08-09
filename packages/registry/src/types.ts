import type { KnowledgeCatalog, TemplateDoc } from '@commonspace/knowledge';

export type ScaffoldMode = 'dry-run' | 'apply';
export type ScaffoldFileStatus = 'create' | 'unchanged' | 'conflict';

export interface RegistryFileManifest {
  path: string;
  role: string;
  source: string;
  digest: string;
  bytes: number;
}

export interface RegistryTemplateManifest {
  id: string;
  name: string;
  version: string;
  target: TemplateDoc['target'];
  digest: string;
  files: readonly RegistryFileManifest[];
  variables: TemplateDoc['variables'];
}

export interface RegistryManifest {
  schemaVersion: 1;
  generatedAt: string;
  packageVersion: string;
  templates: readonly RegistryTemplateManifest[];
}

export interface ScaffoldInput {
  templateId: string;
  projectRoot: string;
  targetDirectory?: string;
  mode?: ScaffoldMode;
  variables?: Readonly<Record<string, string>>;
}

export interface ScaffoldFilePlan {
  source: string;
  target: string;
  relativeTarget: string;
  role: string;
  status: ScaffoldFileStatus;
  expectedDigest: string;
  currentDigest?: string;
  bytes: number;
}

export interface ScaffoldResult {
  schemaVersion: 1;
  templateId: string;
  templateVersion: string;
  projectRoot: string;
  targetDirectory: string;
  mode: ScaffoldMode;
  applied: boolean;
  files: readonly ScaffoldFilePlan[];
  summary: { create: number; unchanged: number; conflict: number };
}

export interface RegistryServiceOptions {
  catalog: KnowledgeCatalog;
  templateRoot: string;
}

export interface RegistryService {
  manifest(): Promise<RegistryManifest>;
  scaffold(input: ScaffoldInput): Promise<ScaffoldResult>;
}
