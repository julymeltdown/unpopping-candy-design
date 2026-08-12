export type KnowledgeStatus = 'stable' | 'beta' | 'experimental' | 'deprecated';
export type KnowledgeKind = 'component' | 'pattern' | 'template' | 'migration';
export interface CodeExample { title: string; code: string; reason?: string; }
export interface ExampleSet { preferred: readonly CodeExample[]; avoid: readonly CodeExample[]; }
export interface AccessibilityDoc { requirements: readonly string[]; keyboard?: readonly string[]; semantics?: readonly string[]; }
export interface KnowledgeBase {
  schemaVersion: 1; kind: KnowledgeKind; id: string; name: string; version: string;
  status: KnowledgeStatus; summary: string; keywords: readonly string[];
  useWhen: readonly string[]; avoidWhen: readonly string[]; accessibility: AccessibilityDoc;
  examples: ExampleSet; tags?: readonly string[]; deprecatedBy?: string;
}
export interface PropDoc { name: string; type: string; required: boolean; defaultValue?: string; description?: string; }
export interface VariantDoc { name: string; guidance: string; }
export interface ComponentDoc extends KnowledgeBase {
  kind: 'component'; package: string; category: string; sourcePath: string;
  entrypoints: readonly string[]; tokens: readonly string[]; related: readonly string[];
  stories: readonly string[]; props: readonly PropDoc[]; variants: readonly VariantDoc[];
  states: readonly string[]; composition?: { parents?: readonly string[]; children?: readonly string[]; };
  stateAttributes?: Readonly<Record<string, string>>;
  nativeElement?: string;
  figma?: { componentKey?: string; nodeUrl?: string; propertyMap?: Readonly<Record<string, string>>; };
}
export interface PatternDoc extends KnowledgeBase {
  kind: 'pattern'; components: readonly string[]; anatomy: readonly string[];
  states: readonly string[]; responsive: readonly string[]; flow?: readonly string[]; stories?: readonly string[];
}
export interface TemplateFileDoc { path: string; role: string; content?: string; source?: string; }
export interface TemplateDoc extends KnowledgeBase {
  kind: 'template'; description: string; components: readonly string[]; patterns: readonly string[];
  files: readonly TemplateFileDoc[]; variables: readonly { name: string; description: string; defaultValue?: string; }[];
  target: 'react-vite' | 'react-vite-fsd' | 'agnostic';
}
export interface MigrationChange { kind: 'rename' | 'remove' | 'replace' | 'manual'; from: string; to?: string; guidance: string; }
export interface MigrationDoc extends KnowledgeBase { kind: 'migration'; fromVersion: string; toVersion: string; changes: readonly MigrationChange[]; }
export type KnowledgeEntry = ComponentDoc | PatternDoc | TemplateDoc | MigrationDoc;
export interface KnowledgeCatalog { schemaVersion: 1; generatedAt: string; packageVersion: string; entries: readonly KnowledgeEntry[]; }
export interface CatalogIssue { code: string; severity: 'error' | 'warning'; entryId?: string; message: string; }
export interface SearchResult { id: string; kind: KnowledgeKind; name: string; summary: string; score: number; reasons: readonly string[]; }
export interface CompatibilityRelease {
  readonly catalogVersion: string;
  readonly catalogDigest: string;
  readonly publicPackageVersions: Readonly<Record<string, string>>;
  readonly allowedPackageSets: readonly (readonly string[])[];
}
export interface CompatibilityManifest {
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly releases: readonly CompatibilityRelease[];
}
