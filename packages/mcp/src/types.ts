import type { KnowledgeCatalog, KnowledgeEntry, SearchResult } from '@unpopping-candy/knowledge';
import type { PopcandyProjectInfo, CompositionPlan, ValidationReport } from '@unpopping-candy/cli';
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
  designMarkdown: string;
  tokens: Record<string, unknown>;
  projectInfo(path: string): Promise<PopcandyProjectInfo>;
  validate(path: string): Promise<ValidationReport>;
  search(query: string, options?: { kind?: KnowledgeEntry['kind']; limit?: number }): readonly SearchResult[];
  get(idOrName: string): KnowledgeEntry | undefined;
  compose(request: string): CompositionPlan;
  registryManifest(): Promise<RegistryManifest>;
  scaffold(input: ScaffoldInput): Promise<ScaffoldResult>;
}

export interface PopcandyMcpDomain {
  listResources(): readonly McpResourceDescriptor[];
  readResource(uri: string, projectPath?: string): Promise<McpResourceContent>;
  projectInfo(input: { path?: string | undefined }): Promise<unknown>;
  search(input: { query: string; kind?: KnowledgeEntry['kind'] | undefined; limit?: number | undefined }): unknown;
  get(input: { id: string }): unknown;
  compose(input: { request: string }): unknown;
  validate(input: { path?: string | undefined }): Promise<unknown>;
  scaffold(input: { templateId: string; path?: string | undefined; targetDirectory?: string | undefined; variables?: Readonly<Record<string, string>> | undefined; apply?: boolean | undefined }): Promise<unknown>;
  listPrompts(): readonly McpPromptDefinition[];
  getPrompt(name: McpPromptDefinition['name'], args: Record<string, string | undefined>): { description: string; text: string };
}
