import type {
  ComponentDoc,
  KnowledgeCatalog,
  KnowledgeEntry,
  MigrationDoc,
  PatternDoc,
  TemplateDoc,
} from "./types.ts";
import { stableStringify } from "./stable-json.ts";
import {
  generateDesignMarkdown,
  publicPackageNames,
} from "./design-generator.ts";

export { stableStringify } from "./stable-json.ts";
export { generateDesignMarkdown } from "./design-generator.ts";

export interface GeneratedTextFile {
  path: string;
  content: string;
}

function escapeMarkdown(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

function fenced(code: string, language = "tsx"): string {
  return `\`\`\`${language}\n${code.trim()}\n\`\`\``;
}

function bulletList(
  items: readonly string[],
  empty = "- None documented.",
): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : empty;
}

function titleCase(value: string): string {
  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function generateComponentMarkdown(component: ComponentDoc): string {
  return `# ${component.name}

> \`${component.id}\` · \`${component.package}\` · ${component.status} · version ${component.version}

${component.summary}

## Import

${component.entrypoints.map((entrypoint) => fenced(`import { ${component.name} } from '${entrypoint}';`)).join("\n\n")}

## Use when

${bulletList(component.useWhen)}

## Avoid when

${bulletList(component.avoidWhen)}

## Variants

${component.variants.length ? component.variants.map((variant) => `- **${variant.name}:** ${variant.guidance}`).join("\n") : "- No public variants."}

## States

${bulletList(component.states)}

## Accessibility

${bulletList(component.accessibility.requirements)}
${component.accessibility.keyboard?.length ? `\n### Keyboard\n\n${bulletList(component.accessibility.keyboard)}` : ""}

## Tokens

${component.tokens.length ? component.tokens.map((token) => `- \`${token}\``).join("\n") : "- No component-specific token contract."}

## Props

${component.props.length ? ["| Name | Type | Required | Default | Description |", "|---|---|---:|---|---|", ...component.props.map((prop) => `| \`${prop.name}\` | \`${escapeMarkdown(prop.type)}\` | ${prop.required ? "Yes" : "No"} | ${prop.defaultValue ? `\`${escapeMarkdown(prop.defaultValue)}\`` : "—"} | ${escapeMarkdown(prop.description ?? "")} |`)].join("\n") : "Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type."}

## Preferred examples

${component.examples.preferred.length ? component.examples.preferred.map((example) => `### ${example.title}\n\n${example.reason ?? ""}\n\n${fenced(example.code)}`).join("\n\n") : "- No preferred example documented."}

## Avoid examples

${component.examples.avoid.length ? component.examples.avoid.map((example) => `### ${example.title}\n\n${example.reason ?? ""}\n\n${fenced(example.code)}`).join("\n\n") : "- No avoid example documented."}

## Related

${component.related.length ? component.related.map((id) => `- \`${id}\``).join("\n") : "- None."}

## Storybook

${component.stories.map((story) => `- \`${story}\``).join("\n")}

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

${pattern.components.map((component) => `- \`${component}\``).join("\n")}

## States

${bulletList(pattern.states)}

## Responsive behavior

${bulletList(pattern.responsive)}

${pattern.flow?.length ? `## Flow\n\n${pattern.flow.map((step, index) => `${index + 1}. ${step}`).join("\n")}\n` : ""}
## Accessibility

${bulletList(pattern.accessibility.requirements)}
`;
}

function entryIndexLine(entry: KnowledgeEntry): string {
  const folder =
    entry.kind === "component"
      ? "components"
      : entry.kind === "pattern"
        ? "patterns"
        : null;
  const link = folder ? `./${folder}/${entry.id}.md` : null;
  return link
    ? `- [${entry.name}](${link}): ${entry.summary}`
    : `- **${entry.name}** (\`${entry.id}\`): ${entry.summary}`;
}

export function generateLlmsFiles(
  catalog: KnowledgeCatalog,
  tokens: Record<string, unknown>,
): GeneratedTextFile[] {
  const components = catalog.entries.filter(
    (entry): entry is ComponentDoc => entry.kind === "component",
  );
  const patterns = catalog.entries.filter(
    (entry): entry is PatternDoc => entry.kind === "pattern",
  );
  const templates = catalog.entries.filter(
    (entry): entry is TemplateDoc => entry.kind === "template",
  );
  const migrations = catalog.entries.filter(
    (entry): entry is MigrationDoc => entry.kind === "migration",
  );
  const index = `# Unpopping Candy

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
  const small = `# Unpopping Candy — compact agent context

Version: ${catalog.packageVersion}

- Public packages: ${publicPackageNames(catalog).join(", ")}.
- Visual packages never fetch, route, authenticate, or own remote state.
- Use semantic tokens and public entrypoints only.
- Search before generating. Cover loading, empty, error, disabled, pending, mobile, dark, and high-contrast states.
- Run popcandy validate and Storybook checks.

Stable components: ${components.map((component) => component.id).join(", ")}

Patterns: ${patterns.map((pattern) => pattern.id).join(", ")}
`;
  const componentsText = `# Unpopping Candy components

${components.map(entryIndexLine).join("\n")}
`;
  const patternsText = `# Unpopping Candy patterns

${patterns.map(entryIndexLine).join("\n")}

## Templates

${templates.map(entryIndexLine).join("\n")}
`;
  const tokenText = `# Unpopping Candy tokens

Use semantic and component tokens instead of hardcoded visual values.

${fenced(stableStringify(tokens), "json")}
`;
  const migrationText = `# Unpopping Candy migrations

${migrations.map((migration) => `## ${migration.name}\n\n${migration.summary}\n\n${migration.changes.map((change) => `- **${titleCase(change.kind)}:** \`${change.from}\`${change.to ? ` → \`${change.to}\`` : ""}. ${change.guidance}`).join("\n")}`).join("\n\n")}
`;
  const full = [
    index,
    small,
    componentsText,
    patternsText,
    tokenText,
    migrationText,
    ...components.map(generateComponentMarkdown),
    ...patterns.map(generatePatternMarkdown),
  ].join("\n\n---\n\n");
  return [
    { path: "agent/llms.txt", content: index },
    { path: "agent/llms-small.txt", content: small },
    { path: "agent/llms-full.txt", content: full },
    { path: "agent/llms-components.txt", content: componentsText },
    { path: "agent/llms-patterns.txt", content: patternsText },
    { path: "agent/llms-tokens.txt", content: tokenText },
    { path: "agent/llms-migrations.txt", content: migrationText },
  ];
}

export function generateAgentDocumentSet(
  catalog: KnowledgeCatalog,
  tokens: Record<string, unknown>,
): GeneratedTextFile[] {
  const components = catalog.entries.filter(
    (entry): entry is ComponentDoc => entry.kind === "component",
  );
  const patterns = catalog.entries.filter(
    (entry): entry is PatternDoc => entry.kind === "pattern",
  );
  return [
    { path: "DESIGN.md", content: generateDesignMarkdown(catalog, tokens) },
    ...generateLlmsFiles(catalog, tokens),
    ...components.map((component) => ({
      path: `agent/components/${component.id}.md`,
      content: generateComponentMarkdown(component),
    })),
    ...patterns.map((pattern) => ({
      path: `agent/patterns/${pattern.id}.md`,
      content: generatePatternMarkdown(pattern),
    })),
  ].map((file) => ({
    ...file,
    content: file.content.endsWith("\n") ? file.content : `${file.content}\n`,
  }));
}
