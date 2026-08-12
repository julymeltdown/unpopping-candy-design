import type { KnowledgeCatalog, KnowledgeEntry } from '@unpopping-candy/knowledge';
import type { CatalogContext, ProjectCatalogContext, ValidationReport } from '@unpopping-candy/cli';
import type { RegistryManifest, ScaffoldInput, ScaffoldResult } from '@unpopping-candy/registry';

export interface McpResourceDescriptor {
  uri: string;
  name: string;
  description: string;
  mimeType: 'application/json' | 'text/markdown';
}

export interface McpResourceContent extends McpResourceDescriptor {
  text: string;
}

export interface McpPromptDefinition {
  name: 'build-interface' | 'migrate-interface' | 'review-interface' | 'author-component';
  title: string;
  description: string;
  arguments: readonly { name: string; required: boolean; description: string }[];
}

export interface McpDomainServices {
  catalog: KnowledgeCatalog;
  designMarkdown(catalog: KnowledgeCatalog): string;
  tokens: Record<string, unknown>;
  projectContext(path: string): Promise<ProjectCatalogContext>;
  catalogContext(path: string): Promise<CatalogContext>;
  validate(catalog: KnowledgeCatalog, path: string): Promise<ValidationReport>;
  registryManifest(catalog: KnowledgeCatalog): Promise<RegistryManifest>;
  scaffold(input: ScaffoldInput): Promise<ScaffoldResult>;
}

export interface PopcandyMcpDomain {
  listResources(): readonly McpResourceDescriptor[];
  readResource(uri: string, projectPath?: string): Promise<McpResourceContent>;
  projectInfo(input: { path?: string | undefined }): Promise<unknown>;
  search(input: { query: string; path?: string | undefined; kind?: KnowledgeEntry['kind'] | undefined; limit?: number | undefined }): Promise<unknown>;
  get(input: { id: string; path?: string | undefined }): Promise<unknown>;
  compose(input: { request: string; path?: string | undefined }): Promise<unknown>;
  validate(input: { path?: string | undefined }): Promise<unknown>;
  scaffold(input: { templateId: string; path?: string | undefined; targetDirectory?: string | undefined; variables?: Readonly<Record<string, string>> | undefined; apply?: boolean | undefined }): Promise<unknown>;
  listPrompts(): readonly McpPromptDefinition[];
  getPrompt(name: McpPromptDefinition['name'], args: Record<string, string | undefined>): { description: string; text: string };
}
