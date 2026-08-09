import type { KnowledgeCatalog, KnowledgeEntry, SearchResult } from '@commonspace/knowledge';
import type { CommonspaceProjectInfo, CompositionPlan, ValidationReport } from '@commonspace/cli';

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
  projectInfo(path: string): Promise<CommonspaceProjectInfo>;
  validate(path: string): Promise<ValidationReport>;
  search(query: string, options?: { kind?: KnowledgeEntry['kind']; limit?: number }): readonly SearchResult[];
  get(idOrName: string): KnowledgeEntry | undefined;
  compose(request: string): CompositionPlan;
}

export interface CommonspaceMcpDomain {
  listResources(): readonly McpResourceDescriptor[];
  readResource(uri: string, projectPath?: string): Promise<McpResourceContent>;
  projectInfo(input: { path?: string }): Promise<unknown>;
  search(input: { query: string; kind?: KnowledgeEntry['kind']; limit?: number }): unknown;
  get(input: { id: string }): unknown;
  compose(input: { request: string }): unknown;
  validate(input: { path?: string }): Promise<unknown>;
  listPrompts(): readonly McpPromptDefinition[];
  getPrompt(name: McpPromptDefinition['name'], args: Record<string, string | undefined>): { description: string; text: string };
}
