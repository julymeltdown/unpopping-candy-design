import type { ComponentDoc, KnowledgeCatalog } from '@commonspace/knowledge';
import type {
  FigmaComponentMapping,
  FigmaIntegrationConfig,
  FigmaManifest,
  FigmaValidationIssue,
  GeneratedFigmaFile,
} from './types.ts';

const FIGMA_NODE_PATTERN = /^https:\/\/www\.figma\.com\/(?:design|file)\/[A-Za-z0-9_-]+\/[^?]+\?node-id=[A-Za-z0-9:%-]+(?:&.*)?$/;

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function mostSpecificEntrypoint(component: ComponentDoc): string {
  return [...component.entrypoints].sort((a, b) => b.length - a.length || a.localeCompare(b))[0] ?? component.package;
}

function placeholderNodeUrl(config: FigmaIntegrationConfig, index: number): string {
  const separator = config.designFileUrl.includes('?') ? '&' : '?';
  return `${config.designFileUrl}${separator}node-id=0-${index + 1}`;
}

function isPlaceholderUrl(value: string): boolean {
  return value.includes('COMMONSPACE_LIBRARY') || /[?&]node-id=0-(?:\d+)(?:&|$)/.test(value);
}

function defaultPropertyMap(component: ComponentDoc): Readonly<Record<string, string>> {
  const output: Record<string, string> = {};
  if (component.variants.length) output.Variant = component.variants.map((variant) => variant.name).join('|');
  if (component.states.includes('disabled')) output.Disabled = 'disabled';
  if (component.states.includes('pending')) output.Pending = 'pending';
  if (component.states.includes('selected')) output.Selected = 'selected';
  return output;
}

export function createFigmaManifest(
  catalog: KnowledgeCatalog,
  config: FigmaIntegrationConfig,
  generatedAt = '2026-08-09T00:00:00.000Z',
): FigmaManifest {
  const components = catalog.entries
    .filter((entry): entry is ComponentDoc => entry.kind === 'component')
    .sort((a, b) => a.id.localeCompare(b.id))
    .map<FigmaComponentMapping>((component, index) => {
      const override = config.mappings[component.id];
      const nodeUrl = override?.nodeUrl ?? placeholderNodeUrl(config, index);
      return {
        componentId: component.id,
        componentName: component.name,
        package: component.package,
        entrypoint: mostSpecificEntrypoint(component),
        sourcePath: component.sourcePath,
        storyId: component.stories[0] ?? '',
        nodeUrl,
        templatePath: `figma/code-connect/${slug(component.id)}.figma.ts`,
        status: isPlaceholderUrl(nodeUrl) ? 'placeholder' : 'ready',
        propertyMap: { ...defaultPropertyMap(component), ...(override?.propertyMap ?? {}) },
      };
    });
  return {
    schemaVersion: 1,
    generatedAt,
    libraryName: config.libraryName,
    packageVersion: catalog.packageVersion,
    components,
  };
}

function escapeTemplate(value: string): string {
  return value.replaceAll('`', '\\`').replaceAll('${', '\\${');
}

function staticExample(component: ComponentDoc): string {
  return component.examples.preferred[0]?.code ?? `<${component.name} />`;
}

export function generateCodeConnectTemplates(catalog: KnowledgeCatalog, manifest: FigmaManifest): GeneratedFigmaFile[] {
  const components = new Map(catalog.entries.filter((entry): entry is ComponentDoc => entry.kind === 'component').map((entry) => [entry.id, entry]));
  return manifest.components.map((mapping) => {
    const component = components.get(mapping.componentId);
    if (!component) throw new Error(`Missing component metadata for ${mapping.componentId}.`);
    const example = escapeTemplate(staticExample(component));
    const content = `// url=${mapping.nodeUrl}\n// source=${mapping.sourcePath}\n// component=${mapping.componentName}\nimport figma from 'figma'\n\nexport default {\n  example: figma.code\`\n    ${example}\n  \`,\n  imports: ['import { ${mapping.componentName} } from "${mapping.entrypoint}"'],\n  id: '${slug(mapping.componentId)}',\n  metadata: {\n    nestable: true,\n    props: {\n      knowledgeId: '${mapping.componentId}',\n      storyId: '${mapping.storyId}',\n    },\n  },\n}\n`;
    return { path: mapping.templatePath, content };
  });
}

export function validateFigmaManifest(manifest: FigmaManifest, options: { allowPlaceholders?: boolean } = {}): FigmaValidationIssue[] {
  const issues: FigmaValidationIssue[] = [];
  const seenNodes = new Map<string, string>();
  for (const component of manifest.components) {
    if (!FIGMA_NODE_PATTERN.test(component.nodeUrl)) issues.push({ code: 'invalid-node-url', severity: 'error', componentId: component.componentId, message: `Invalid Figma component node URL: ${component.nodeUrl}` });
    if (!options.allowPlaceholders && component.status === 'placeholder') issues.push({ code: 'placeholder-node', severity: 'error', componentId: component.componentId, message: 'Replace the generated placeholder with a real Figma component node URL before publishing.' });
    if (/\/(?:src|dist)(?:\/|$)/.test(component.entrypoint)) issues.push({ code: 'private-entrypoint', severity: 'error', componentId: component.componentId, message: `Code Connect import bypasses the public package API: ${component.entrypoint}` });
    if (!component.storyId) issues.push({ code: 'missing-story', severity: 'error', componentId: component.componentId, message: 'A Storybook contract is required before connecting the component to Figma.' });
    const existing = seenNodes.get(component.nodeUrl);
    if (existing && component.status === 'ready') issues.push({ code: 'duplicate-node', severity: 'error', componentId: component.componentId, message: `Figma node is already connected to ${existing}.` });
    else seenNodes.set(component.nodeUrl, component.componentId);
  }
  return issues.sort((a, b) => a.componentId.localeCompare(b.componentId) || a.code.localeCompare(b.code));
}
