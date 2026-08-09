export interface FigmaMappingOverride {
  nodeUrl: string;
  propertyMap?: Readonly<Record<string, string>>;
}

export interface FigmaIntegrationConfig {
  schemaVersion: 1;
  libraryName: string;
  designFileUrl: string;
  mappings: Readonly<Record<string, FigmaMappingOverride>>;
}

export interface FigmaComponentMapping {
  componentId: string;
  componentName: string;
  package: string;
  entrypoint: string;
  sourcePath: string;
  storyId: string;
  nodeUrl: string;
  templatePath: string;
  status: 'placeholder' | 'ready';
  propertyMap: Readonly<Record<string, string>>;
}

export interface FigmaManifest {
  schemaVersion: 1;
  generatedAt: string;
  libraryName: string;
  packageVersion: string;
  components: readonly FigmaComponentMapping[];
}

export interface GeneratedFigmaFile {
  path: string;
  content: string;
}

export interface FigmaValidationIssue {
  code: 'invalid-node-url' | 'placeholder-node' | 'duplicate-node' | 'private-entrypoint' | 'missing-story';
  severity: 'error' | 'warning';
  componentId: string;
  message: string;
}
