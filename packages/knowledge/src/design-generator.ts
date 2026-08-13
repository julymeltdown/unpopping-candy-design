import { bundledCompatibilityManifest } from "./generated/compatibility.ts";
import type {
  ComponentDoc,
  KnowledgeCatalog,
  PatternDoc,
  TemplateDoc,
} from "./types.ts";

const PACKAGE_BOUNDARIES = [
  [
    "@unpopping-candy/tokens",
    "Reference, semantic, and component tokens",
    "React state or product behavior",
  ],
  [
    "@unpopping-candy/theme",
    "Theme, density, accent, and scope",
    "Product data",
  ],
  [
    "@unpopping-candy/icons",
    "Semantic icon names backed by Ant Design Icons",
    "Product-specific actions",
  ],
  [
    "@unpopping-candy/ui",
    "Product-independent accessible components",
    "Network, router, cache, auth",
  ],
  [
    "@unpopping-candy/social",
    "API-independent social presentation models and patterns",
    "Fetching, mutations, application state",
  ],
  [
    "@unpopping-candy/knowledge",
    "Deterministic catalog, compatibility, and document generators",
    "Rendering, filesystem writes, or product state",
  ],
  [
    "@unpopping-candy/registry",
    "Checksum-verified local template planning and guarded writes",
    "Network fetching or application behavior",
  ],
  [
    "@unpopping-candy/cli",
    "Installed-version discovery, composition, validation, and scaffolding",
    "Component rendering or hosted services",
  ],
  [
    "@unpopping-candy/mcp",
    "Local stdio adapter over knowledge, CLI, Registry, and tokens",
    "LLM calls or a duplicate catalog",
  ],
] as const;

function escapeMarkdown(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function bulletList(items: readonly string[], empty = "- None documented.") {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : empty;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function publicPackageNames(
  catalog: KnowledgeCatalog,
): readonly string[] {
  const release = bundledCompatibilityManifest.releases.find(
    (item) => item.catalogVersion === catalog.packageVersion,
  );
  if (!release)
    throw new Error(
      `Missing compatibility release for catalog ${catalog.packageVersion}.`,
    );
  const actual = Object.keys(release.publicPackageVersions).sort();
  const expected = PACKAGE_BOUNDARIES.map(([name]) => name).sort();
  if (actual.join("\n") !== expected.join("\n")) {
    throw new Error(
      "Design package boundaries must match the compatibility manifest.",
    );
  }
  return PACKAGE_BOUNDARIES.map(([name]) => name);
}

function frontmatter(data: KnowledgeCatalog, tokens: Record<string, unknown>) {
  const color = tokens.color;
  if (color !== undefined && !isRecord(color))
    throw new Error("Color tokens must be an object.");
  const semantic = color?.semantic;
  if (semantic !== undefined && !isRecord(semantic))
    throw new Error("Semantic color tokens must be an object.");
  const lookup = (name: string, fallback: string) => {
    const token = semantic?.[name];
    if (token === undefined) return fallback;
    if (!isRecord(token) || typeof token.$value !== "string")
      throw new Error(`Semantic token ${name} must have a string $value.`);
    return token.$value;
  };
  return [
    "---",
    'schema: "https://designmd.org/spec/0.1"',
    `version: "${data.packageVersion}"`,
    'name: "Unpopping Candy"',
    'description: "AI-operable React design system for content-rich, social, editorial, and community products."',
    'sourceOfTruth: "agent/manifests/catalog.json"',
    "generated: true",
    "colors:",
    `  canvas: "${lookup("canvas", "{color.reference.neutral50}")}"`,
    `  surface: "${lookup("surface", "{color.reference.neutral0}")}"`,
    `  text: "${lookup("text", "{color.reference.neutral950}")}"`,
    `  textMuted: "${lookup("textMuted", "{color.reference.neutral600}")}"`,
    `  border: "${lookup("border", "{color.reference.neutral200}")}"`,
    `  action: "${lookup("action", "{color.reference.blue500}")}"`,
    `  positive: "${lookup("positive", "{color.reference.green600}")}"`,
    `  warning: "${lookup("warning", "{color.reference.amber700}")}"`,
    `  critical: "${lookup("critical", "{color.reference.red600}")}"`,
    "typography:",
    '  ui: "Inter, Pretendard, IBM Plex Sans KR, system-ui, sans-serif"',
    '  mono: "IBM Plex Mono, SFMono-Regular, Consolas, monospace"',
    "density:",
    '  default: "comfortable"',
    '  supported: ["comfortable", "compact"]',
    'themes: ["light", "dark", "system", "high-contrast"]',
    "packages:",
    ...publicPackageNames(data).map((name) => `  - "${name}"`),
    `stableComponents: ${data.entries.filter((entry) => entry.kind === "component" && entry.status === "stable").length}`,
    "---",
  ].join("\n");
}

function componentTable(components: readonly ComponentDoc[]): string {
  return [
    "| Component | Package | Category | Summary |",
    "|---|---|---|---|",
    ...components.map(
      (component) =>
        `| [${escapeMarkdown(component.name)}](./agent/components/${component.id}.md) | \`${component.package}\` | ${escapeMarkdown(component.category)} | ${escapeMarkdown(component.summary)} |`,
    ),
  ].join("\n");
}

function packageBoundaryTable(): string {
  return [
    "| Package | Responsibility | Must not own |",
    "|---|---|---|",
    ...PACKAGE_BOUNDARIES.map(
      ([name, responsibility, exclusion]) =>
        `| \`${name}\` | ${responsibility} | ${exclusion} |`,
    ),
  ].join("\n");
}

export function generateDesignMarkdown(
  catalog: KnowledgeCatalog,
  tokens: Record<string, unknown>,
): string {
  const components = catalog.entries.filter(
    (entry): entry is ComponentDoc => entry.kind === "component",
  );
  const patterns = catalog.entries.filter(
    (entry): entry is PatternDoc => entry.kind === "pattern",
  );
  const templates = catalog.entries.filter(
    (entry): entry is TemplateDoc => entry.kind === "template",
  );
  return `${frontmatter(catalog, tokens)}

# Unpopping Candy Design Contract

Unpopping Candy is a reusable React design system for content-rich, social, editorial, and community products. This file is generated from component-adjacent metadata and token manifests. Do not edit generated sections by hand; update the canonical \`*.docs.ts\` entry and run \`npm run agent:generate\`.

## Agent operating contract

1. Detect the project and installed Unpopping Candy versions before generating code.
2. Search existing components, patterns, and templates before inventing a new surface.
3. Import only documented public entrypoints; never import \`src\` or package internals.
4. Keep remote state, routing, authentication, and application workflow outside visual packages.
5. Use Unpopping Candy tokens instead of hardcoded color, spacing, radius, shadow, or motion values.
6. Cover loading, empty, populated, error, disabled, pending, and responsive states when they apply.
7. Generate or update a Storybook story and run accessibility and interaction checks.
8. Run \`popcandy validate\` before presenting the result.

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

${packageBoundaryTable()}

Authentication, server state, Feature-Sliced Design application code, API clients, and backend services belong to the separate application kit.

## Foundations

### Color

Use semantic variables such as \`--popcandy-canvas\`, \`--popcandy-surface\`, \`--popcandy-ink\`, \`--popcandy-border\`, \`--popcandy-accent\`, \`--popcandy-positive\`, \`--popcandy-warning\`, and \`--popcandy-critical\`. Reference colors are implementation inputs; product code should normally consume semantic roles.

### Typography

Use the sans stack for interface and content text. Use the mono stack only for identifiers, request references, code, and machine-oriented values. Keep labels explicit and readable at 200% zoom.

### Spacing and layout

Use the \`--popcandy-space-*\` scale and the Stack, Inline, Container, Surface, and Separator primitives. Do not create arbitrary one-off margins when a composition primitive expresses the relationship.

### Motion

Use \`--popcandy-motion-fast\`, \`--popcandy-motion-normal\`, and \`--popcandy-motion-slow\` with the shared easing variables. Motion explains state change; it must not delay task completion and must respect reduced-motion preferences.

## Stable components

${componentTable(components)}

## Product patterns

${patterns.map((pattern) => `### ${pattern.name}\n\n${pattern.summary}\n\n**Use when**\n\n${bulletList(pattern.useWhen)}\n\n**Anatomy**\n\n${bulletList(pattern.anatomy)}\n\n**Required states**\n\n${bulletList(pattern.states)}\n\n**Components**\n\n${pattern.components.map((id) => `- \`${id}\``).join("\n")}`).join("\n\n")}

## Templates

${templates.map((template) => `- **${template.name}** (\`${template.id}\`, target: \`${template.target}\`): ${template.description}`).join("\n")}

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

- Import from \`@unpopping-candy/*/src/*\`.
- Fetch, navigate, authenticate, or mutate inside \`@unpopping-candy/ui\` or \`@unpopping-candy/social\`.
- Hardcode brand colors, spacing, radius, shadows, or motion durations.
- Invent component props or component names.
- Treat a static screenshot as functional UI.
- Omit loading, empty, failure, and disabled states where they are possible.

## AI workflow

\`\`\`text
popcandy info --json
→ popcandy search "<task>" --json
→ popcandy compose "<task>" --json
→ inspect selected component and pattern guidance
→ scaffold or implement with public imports
→ create/update Storybook stories
→ popcandy validate --json
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
