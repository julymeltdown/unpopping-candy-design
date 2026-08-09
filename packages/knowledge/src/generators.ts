import type {
  ComponentDoc,
  KnowledgeCatalog,
  KnowledgeEntry,
  MigrationDoc,
  PatternDoc,
  TemplateDoc,
} from './types.ts';
import { stableStringify } from './stable-json.ts';

export { stableStringify } from './stable-json.ts';

export interface GeneratedTextFile {
  path: string;
  content: string;
}

function escapeMarkdown(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function fenced(code: string, language = 'tsx'): string {
  return `\`\`\`${language}\n${code.trim()}\n\`\`\``;
}

function bulletList(items: readonly string[], empty = '- None documented.'): string {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : empty;
}

function titleCase(value: string): string {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function componentTable(components: readonly ComponentDoc[]): string {
  return [
    '| Component | Package | Category | Summary |',
    '|---|---|---|---|',
    ...components.map((component) => `| [${escapeMarkdown(component.name)}](./agent/components/${component.id}.md) | \`${component.package}\` | ${escapeMarkdown(component.category)} | ${escapeMarkdown(component.summary)} |`),
  ].join('\n');
}

function frontmatter(catalog: KnowledgeCatalog, tokens: Record<string, unknown>): string {
  const semantic = ((tokens.color as Record<string, unknown> | undefined)?.semantic ?? {}) as Record<string, { $value?: unknown }>;
  const lookup = (name: string, fallback: string) => String(semantic[name]?.$value ?? fallback);
  return [
    '---',
    'schema: "https://designmd.org/spec/0.1"',
    `version: "${catalog.packageVersion}"`,
    'name: "Commonspace UI"',
    'description: "AI-operable React design system for content-rich, social, editorial, and community products."',
    'sourceOfTruth: "agent/manifests/catalog.json"',
    'generated: true',
    'colors:',
    `  canvas: "${lookup('canvas', '{color.reference.neutral50}')}"`,
    `  surface: "${lookup('surface', '{color.reference.neutral0}')}"`,
    `  text: "${lookup('text', '{color.reference.neutral950}')}"`,
    `  textMuted: "${lookup('textMuted', '{color.reference.neutral600}')}"`,
    `  border: "${lookup('border', '{color.reference.neutral200}')}"`,
    `  action: "${lookup('action', '{color.reference.blue500}')}"`,
    `  positive: "${lookup('positive', '{color.reference.green600}')}"`,
    `  warning: "${lookup('warning', '{color.reference.amber700}')}"`,
    `  critical: "${lookup('critical', '{color.reference.red600}')}"`,
    'typography:',
    '  ui: "Inter, Pretendard, IBM Plex Sans KR, system-ui, sans-serif"',
    '  mono: "IBM Plex Mono, SFMono-Regular, Consolas, monospace"',
    'density:',
    '  default: "comfortable"',
    '  supported: ["comfortable", "compact"]',
    'themes: ["light", "dark", "system", "high-contrast"]',
    'packages:',
    '  - "@commonspace/tokens"',
    '  - "@commonspace/theme"',
    '  - "@commonspace/icons"',
    '  - "@commonspace/ui"',
    '  - "@commonspace/social"',
    `stableComponents: ${catalog.entries.filter((entry) => entry.kind === 'component' && entry.status === 'stable').length}`,
    '---',
  ].join('\n');
}

export function generateDesignMarkdown(catalog: KnowledgeCatalog, tokens: Record<string, unknown>): string {
  const components = catalog.entries.filter((entry): entry is ComponentDoc => entry.kind === 'component');
  const patterns = catalog.entries.filter((entry): entry is PatternDoc => entry.kind === 'pattern');
  const templates = catalog.entries.filter((entry): entry is TemplateDoc => entry.kind === 'template');
  return `${frontmatter(catalog, tokens)}

# Commonspace UI Design Contract

Commonspace UI is a reusable React design system for content-rich, social, editorial, and community products. This file is generated from component-adjacent metadata and token manifests. Do not edit generated sections by hand; update the canonical \`*.docs.ts\` entry and run \`npm run agent:generate\`.

## Agent operating contract

1. Detect the project and installed Commonspace versions before generating code.
2. Search existing components, patterns, and templates before inventing a new surface.
3. Import only documented public entrypoints; never import \`src\` or package internals.
4. Keep remote state, routing, authentication, and application workflow outside visual packages.
5. Use Commonspace tokens instead of hardcoded color, spacing, radius, shadow, or motion values.
6. Cover loading, empty, populated, error, disabled, pending, and responsive states when they apply.
7. Generate or update a Storybook story and run accessibility and interaction checks.
8. Run \`commonspace validate\` before presenting the result.

## System promise

- Content leads; chrome recedes.
- Every interactive state is keyboard reachable and visibly focused.
- Feedback explains what changed, what was preserved, and what the user can do next.
- Components are controlled by consumer data and callbacks; they do not fetch.
- Themes are CSS-variable contracts, not hidden runtime styling.
- Social patterns express product concepts but never import an API DTO, router, cache, auth runtime, or application slice.

## Visual language

- Use neutral canvas and surfaces; authored content supplies most color.
- Use one restrained accent role for actions and selection.
- Prefer borders and spacing to decorative shadows.
- Radius is functional, not ornamental.
- Reserve positive, warning, and critical colors for real state.
- Avoid ornamental gradients, glass effects, fake metrics, decorative pills, and nested card grids.
- Use typography and whitespace to establish hierarchy before adding containers.

## Package boundaries

| Package | Responsibility | Must not own |
|---|---|---|
| \`@commonspace/tokens\` | Reference, semantic, and component tokens | React state or product behavior |
| \`@commonspace/theme\` | Theme, density, accent, and scope | Product data |
| \`@commonspace/icons\` | Semantic icon names backed by Ant Design Icons | Product-specific actions |
| \`@commonspace/ui\` | Product-independent accessible components | Network, router, cache, auth |
| \`@commonspace/social\` | API-independent social presentation models and patterns | Fetching, mutations, application state |

Authentication, server state, Feature-Sliced Design application code, API clients, and backend services belong to the separate application kit.

## Foundations

### Color

Use semantic variables such as \`--cs-canvas\`, \`--cs-surface\`, \`--cs-ink\`, \`--cs-border\`, \`--cs-accent\`, \`--cs-positive\`, \`--cs-warning\`, and \`--cs-critical\`. Reference colors are implementation inputs; product code should normally consume semantic roles.

### Typography

Use the sans stack for interface and content text. Use the mono stack only for identifiers, request references, code, and machine-oriented values. Keep labels explicit and readable at 200% zoom.

### Spacing and layout

Use the \`--cs-space-*\` scale and the Stack, Inline, Container, Surface, and Separator primitives. Do not create arbitrary one-off margins when a composition primitive expresses the relationship.

### Motion

Use \`--cs-motion-fast\`, \`--cs-motion-normal\`, and \`--cs-motion-slow\` with the shared easing variables. Motion explains state change; it must not delay task completion and must respect reduced-motion preferences.

## Stable components

${componentTable(components)}

## Product patterns

${patterns.map((pattern) => `### ${pattern.name}\n\n${pattern.summary}\n\n**Use when**\n\n${bulletList(pattern.useWhen)}\n\n**Anatomy**\n\n${bulletList(pattern.anatomy)}\n\n**Required states**\n\n${bulletList(pattern.states)}\n\n**Components**\n\n${pattern.components.map((id) => `- \`${id}\``).join('\n')}`).join('\n\n')}

## Templates

${templates.map((template) => `- **${template.name}** (\`${template.id}\`, target: \`${template.target}\`): ${template.description}`).join('\n')}

## Accessibility baseline

- Meet WCAG 2.2 AA for shipped surfaces.
- Preserve native semantics and visible keyboard focus.
- Give every icon-only control an accessible name.
- Do not encode status with color alone.
- Maintain a usable 320px reflow and 200% zoom.
- Keep loading, errors, and state changes available to assistive technology.
- Restore focus after overlays close and avoid unexpected focus movement.

## Content and feedback language

Use specific verbs and name the affected object. For failures, state what failed, what remains preserved, and the next valid action. Never render raw server messages, tokens, stack traces, or unvalidated request identifiers.

## Do

- Search and reuse a stable component or pattern before creating a new one.
- Compose layout with Stack, Inline, Container, and Surface.
- Keep application state and side effects in the consuming app.
- Use controlled props for product behavior.
- Include representative Korean, English, long-content, mobile, dark, and high-contrast states in stories.

## Do not

- Import from \`@commonspace/*/src/*\`.
- Fetch, navigate, authenticate, or mutate inside \`@commonspace/ui\` or \`@commonspace/social\`.
- Hardcode brand colors, spacing, radius, shadows, or motion durations.
- invent component props or component names.
- Treat a static screenshot as functional UI.
- omit loading, empty, failure, and disabled states where they are possible.

## AI workflow

\`\`\`text
commonspace info --json
→ commonspace search "<task>" --json
→ commonspace compose "<task>" --json
→ inspect selected component and pattern guidance
→ scaffold or implement with public imports
→ create/update Storybook stories
→ commonspace validate --json
→ Storybook interaction and accessibility checks
\`\`\`

## Canonical sources

- Catalog: \`agent/manifests/catalog.json\`
- Components: \`agent/components/*.md\`
- Patterns: \`agent/patterns/*.md\`
- Tokens: \`agent/llms-tokens.txt\`
- Migrations: \`agent/llms-migrations.txt\`
- Skills: \`skills/*/SKILL.md\`
`;
}

export function generateComponentMarkdown(component: ComponentDoc): string {
  return `# ${component.name}

> \`${component.id}\` · \`${component.package}\` · ${component.status} · version ${component.version}

${component.summary}

## Import

${component.entrypoints.map((entrypoint) => fenced(`import { ${component.name} } from '${entrypoint}';`)).join('\n\n')}

## Use when

${bulletList(component.useWhen)}

## Avoid when

${bulletList(component.avoidWhen)}

## Variants

${component.variants.length ? component.variants.map((variant) => `- **${variant.name}:** ${variant.guidance}`).join('\n') : '- No public variants.'}

## States

${bulletList(component.states)}

## Accessibility

${bulletList(component.accessibility.requirements)}
${component.accessibility.keyboard?.length ? `\n### Keyboard\n\n${bulletList(component.accessibility.keyboard)}` : ''}

## Tokens

${component.tokens.length ? component.tokens.map((token) => `- \`${token}\``).join('\n') : '- No component-specific token contract.'}

## Props

${component.props.length ? ['| Name | Type | Required | Default | Description |','|---|---|---:|---|---|',...component.props.map((prop) => `| \`${prop.name}\` | \`${escapeMarkdown(prop.type)}\` | ${prop.required ? 'Yes' : 'No'} | ${prop.defaultValue ? `\`${escapeMarkdown(prop.defaultValue)}\`` : '—'} | ${escapeMarkdown(prop.description ?? '')} |`)].join('\n') : 'Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.'}

## Preferred examples

${component.examples.preferred.length ? component.examples.preferred.map((example) => `### ${example.title}\n\n${example.reason ?? ''}\n\n${fenced(example.code)}`).join('\n\n') : '- No preferred example documented.'}

## Avoid examples

${component.examples.avoid.length ? component.examples.avoid.map((example) => `### ${example.title}\n\n${example.reason ?? ''}\n\n${fenced(example.code)}`).join('\n\n') : '- No avoid example documented.'}

## Related

${component.related.length ? component.related.map((id) => `- \`${id}\``).join('\n') : '- None.'}

## Storybook

${component.stories.map((story) => `- \`${story}\``).join('\n')}

## Source

- \`${component.sourcePath}\`
`;
}

export function generatePatternMarkdown(pattern: PatternDoc): string {
  return `# ${pattern.name}

> \`${pattern.id}\` · ${pattern.status} · version ${pattern.version}

${pattern.summary}

## Use when

${bulletList(pattern.useWhen)}

## Avoid when

${bulletList(pattern.avoidWhen)}

## Anatomy

${bulletList(pattern.anatomy)}

## Components

${pattern.components.map((component) => `- \`${component}\``).join('\n')}

## States

${bulletList(pattern.states)}

## Responsive behavior

${bulletList(pattern.responsive)}

${pattern.flow?.length ? `## Flow\n\n${pattern.flow.map((step, index) => `${index + 1}. ${step}`).join('\n')}\n` : ''}
## Accessibility

${bulletList(pattern.accessibility.requirements)}
`;
}

function entryIndexLine(entry: KnowledgeEntry): string {
  const folder = entry.kind === 'component' ? 'components' : entry.kind === 'pattern' ? 'patterns' : null;
  const link = folder ? `./${folder}/${entry.id}.md` : null;
  return link ? `- [${entry.name}](${link}): ${entry.summary}` : `- **${entry.name}** (\`${entry.id}\`): ${entry.summary}`;
}

export function generateLlmsFiles(catalog: KnowledgeCatalog, tokens: Record<string, unknown>): GeneratedTextFile[] {
  const components = catalog.entries.filter((entry): entry is ComponentDoc => entry.kind === 'component');
  const patterns = catalog.entries.filter((entry): entry is PatternDoc => entry.kind === 'pattern');
  const templates = catalog.entries.filter((entry): entry is TemplateDoc => entry.kind === 'template');
  const migrations = catalog.entries.filter((entry): entry is MigrationDoc => entry.kind === 'migration');
  const index = `# Commonspace UI

> AI-operable React design system for content-rich and social products. Version ${catalog.packageVersion}.

## Core context

- [Design contract](../DESIGN.md)
- [Components](./llms-components.txt)
- [Patterns](./llms-patterns.txt)
- [Tokens](./llms-tokens.txt)
- [Migrations](./llms-migrations.txt)
- [Full context](./llms-full.txt)
- [Machine catalog](./manifests/catalog.json)

## Agent sequence

1. Detect the installed project version.
2. Search the catalog.
3. Compose from existing patterns and templates.
4. Validate imports, props, tokens, states, and accessibility.
`;
  const small = `# Commonspace UI — compact agent context

Version: ${catalog.packageVersion}

- Public packages: @commonspace/tokens, @commonspace/theme, @commonspace/icons, @commonspace/ui, @commonspace/social.
- Visual packages never fetch, route, authenticate, or own remote state.
- Use semantic tokens and public entrypoints only.
- Search before generating. Cover loading, empty, error, disabled, pending, mobile, dark, and high-contrast states.
- Run commonspace validate and Storybook checks.

Stable components: ${components.map((component) => component.id).join(', ')}

Patterns: ${patterns.map((pattern) => pattern.id).join(', ')}
`;
  const componentsText = `# Commonspace UI components

${components.map(entryIndexLine).join('\n')}
`;
  const patternsText = `# Commonspace UI patterns

${patterns.map(entryIndexLine).join('\n')}

## Templates

${templates.map(entryIndexLine).join('\n')}
`;
  const tokenText = `# Commonspace UI tokens

Use semantic and component tokens instead of hardcoded visual values.

${fenced(stableStringify(tokens), 'json')}
`;
  const migrationText = `# Commonspace UI migrations

${migrations.map((migration) => `## ${migration.name}\n\n${migration.summary}\n\n${migration.changes.map((change) => `- **${titleCase(change.kind)}:** \`${change.from}\`${change.to ? ` → \`${change.to}\`` : ''}. ${change.guidance}`).join('\n')}`).join('\n\n')}
`;
  const full = [index, small, componentsText, patternsText, tokenText, migrationText, ...components.map(generateComponentMarkdown), ...patterns.map(generatePatternMarkdown)].join('\n\n---\n\n');
  return [
    { path: 'agent/llms.txt', content: index },
    { path: 'agent/llms-small.txt', content: small },
    { path: 'agent/llms-full.txt', content: full },
    { path: 'agent/llms-components.txt', content: componentsText },
    { path: 'agent/llms-patterns.txt', content: patternsText },
    { path: 'agent/llms-tokens.txt', content: tokenText },
    { path: 'agent/llms-migrations.txt', content: migrationText },
  ];
}

export function generateAgentDocumentSet(catalog: KnowledgeCatalog, tokens: Record<string, unknown>): GeneratedTextFile[] {
  const components = catalog.entries.filter((entry): entry is ComponentDoc => entry.kind === 'component');
  const patterns = catalog.entries.filter((entry): entry is PatternDoc => entry.kind === 'pattern');
  return [
    { path: 'DESIGN.md', content: generateDesignMarkdown(catalog, tokens) },
    ...generateLlmsFiles(catalog, tokens),
    ...components.map((component) => ({ path: `agent/components/${component.id}.md`, content: generateComponentMarkdown(component) })),
    ...patterns.map((pattern) => ({ path: `agent/patterns/${pattern.id}.md`, content: generatePatternMarkdown(pattern) })),
  ].map((file) => ({ ...file, content: file.content.endsWith('\n') ? file.content : `${file.content}\n` }));
}
