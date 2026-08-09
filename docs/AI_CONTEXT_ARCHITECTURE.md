# AI context architecture

## Purpose

Unpopping Candy is not considered AI-friendly merely because an agent can read its README. The repository is designed so an agent can discover the exact installed system, select valid components and patterns, generate code through public APIs, and verify the result against the same contracts used by human contributors.

The central rule is:

> Component source, adjacent structured guidance, tokens, and executable stories form one canonical knowledge graph. Every AI-facing surface is derived from or queries that graph.

## System overview

```text
React components + public TypeScript API
Design tokens + semantic icon registry
Component-adjacent *.docs.ts metadata
Pattern, template, and migration metadata
Storybook contract stories
                 │
                 ▼
       @unpopping-candy/knowledge
       deterministic compiler
                 │
     ┌───────────┼───────────────┬────────────────┬──────────────┐
     ▼           ▼               ▼                ▼              ▼
DESIGN.md   llms*.txt       JSON manifests   component docs   pattern docs
     │           │               │                │              │
     └───────────┴───────┬───────┴───────────┬────┴──────────────┘
                         ▼                   ▼
               @unpopping-candy/cli      @unpopping-candy/registry
                         │                   │
                         ├───────────┬───────┤
                         ▼           ▼       ▼
                  Agent Skills     MCP    guarded scaffold
                         │           │
                         └─────┬─────┘
                               ▼
                    agent-generated interface
                               │
             ┌─────────────────┼──────────────────┐
             ▼                 ▼                  ▼
     Storybook MCP       @unpopping-candy/evals    Figma Code Connect
     browser/a11y test   static quality gate   code-design mapping
```

## Canonical knowledge source

The canonical unit is a typed knowledge entry.

```ts
export interface ComponentDoc {
  kind: 'component';
  id: string;
  name: string;
  package: string;
  version: string;
  sourcePath: string;
  entrypoints: readonly string[];
  props: readonly PropDoc[];
  variants: readonly VariantDoc[];
  states: readonly string[];
  tokens: readonly string[];
  useWhen: readonly string[];
  avoidWhen: readonly string[];
  accessibility: AccessibilityDoc;
  examples: ExampleSet;
  stories: readonly string[];
}
```

Component metadata lives beside the implementation:

```text
packages/ui/src/button/
├─ button.tsx
├─ button.css
└─ button.docs.ts
```

The compiler derives the public prop contract and native element from TypeScript source rather than maintaining a second hand-written prop list. Human-authored metadata supplies what TypeScript cannot infer reliably:

- why the component exists;
- when to use or avoid it;
- semantic meaning of variants;
- required visual and interaction states;
- accessibility requirements;
- expected composition;
- preferred and discouraged examples;
- related patterns, templates, tokens, and stories.

## Knowledge kinds

### Component

A public React surface with exact entrypoints, props, variants, state contract, tokens, examples, and Story IDs.

### Pattern

A reusable product-level composition such as a social feed, form action region, profile surface, or failure-recovery sequence. Patterns describe anatomy, flow, responsive behavior, and state completeness without owning server data.

### Template

A guarded source scaffold composed from public packages. Templates are distributed through Registry metadata with exact file checksums and variables.

### Migration

A versioned compatibility record describing renames, replacements, removals, and manual changes.

## Generated artifacts

`npm run agent:generate` produces the complete portable context set.

| Artifact | Purpose |
|---|---|
| `DESIGN.md` | Portable visual and product contract fallback |
| `agent/llms.txt` | Compact AI documentation index |
| `agent/llms-small.txt` | Minimal context for constrained sessions |
| `agent/llms-full.txt` | Full generated context snapshot |
| `agent/llms-components.txt` | Component-only context |
| `agent/llms-patterns.txt` | Product-pattern context |
| `agent/llms-tokens.txt` | Token context |
| `agent/llms-migrations.txt` | Version and migration context |
| `agent/manifests/catalog.json` | Complete machine-readable catalog |
| `agent/manifests/components.json` | Component subset |
| `agent/manifests/patterns.json` | Pattern subset |
| `agent/manifests/templates.json` | Template subset |
| `agent/manifests/migrations.json` | Migration subset |
| `agent/manifests/stories.json` | Storybook contract IDs and locations |
| `agent/manifests/registry.json` | Registry files and checksums |
| `agent/manifests/skills.json` | Portable Skill inventory |
| `agent/manifests/evals.json` | Deterministic agent-evaluation baseline |
| `agent/manifests/figma.json` | Figma Code Connect mapping status |

Generated artifacts are deterministic. Their timestamp is fixed unless `SOURCE_DATE_EPOCH` is explicitly supplied. `npm run agent:check` fails when any committed artifact is stale.

## Progressive disclosure

The system avoids loading the entire design system into every prompt.

```text
Start of task
→ AGENTS.md and Skill name/description

Project inspection
→ popcandy_project_info or CLI info

Discovery
→ bounded search and compose results

Implementation
→ exact selected entries only

Verification
→ Storybook, validate, eval, and Figma resources as needed
```

`DESIGN.md` and `llms-full.txt` are fallbacks, not the primary runtime database for a capable agent.

## Deterministic interfaces

### CLI

The CLI is the local operational interface. It detects the current project, searches exact installed metadata, creates bounded composition plans, validates source, and performs guarded Registry scaffolding.

### MCP

The MCP server is intentionally thin. It wraps the same catalog, CLI services, tokens, and Registry instead of maintaining a second knowledge database. The tool surface is compressed into generic operations rather than one tool per component.

### Agent Skills

Skills describe procedures, not a duplicate component catalog. They require agents to detect, search, inspect, implement, create stories, and verify in a consistent order.

### Storybook

Storybook is the executable UI truth. Dedicated contract stories bind every public component to a stable Story ID. The Storybook MCP addon provides browser-facing component context and validation without moving browser logic into the Unpopping Candy MCP.

### Registry

Registry templates distribute page and block compositions. The Registry is local, checksum-backed, dry-run by default, and prohibits writes outside the selected project root.

### Evaluations

The evaluation harness measures generated source against the installed catalog. It reports invalid imports, invented props, token bypass, basic accessibility failures, state coverage, Unpopping Candy component reuse, and expected-component recall.

### Figma Code Connect

Code Connect templates are generated from the exact component catalog. They preserve public imports, source references, preferred examples, Story IDs, and placeholder status. Publication remains blocked until a real Figma node URL is supplied and the publish gate passes.

## Trust boundaries

### Read-only by default

Search, get, compose, project inspection, resources, and validation do not mutate the consumer project.

### Explicit writes

Registry scaffolding returns a dry-run plan by default. Writing requires explicit `--apply` or `apply: true`.

### Filesystem containment

Registry actions reject:

- absolute targets;
- `..` traversal;
- NUL bytes;
- source paths outside the bundled template root;
- target paths outside the detected project root;
- symlink escapes;
- conflicting existing files.

### No hidden model call

CLI, MCP, Registry, generators, and validators are deterministic. They do not call another model or remote code-generation service.

### No secret context

Project inspection returns package, framework, source-root, configuration, and style-import information. It does not return environment variables, credentials, tokens, or file contents unrelated to the design-system task.

## Version accuracy

Every catalog entry contains a package version. The project detector reports installed `@unpopping-candy/*` versions. An agent should never assume that documentation from another branch or release matches the consumer project.

The expected sequence is:

```text
project info
→ installed versions
→ bundled or selected version catalog
→ exact component and migration records
→ implementation
```

## Adding a new AI surface

A new integration must consume the canonical catalog or existing deterministic service. It must not introduce a manually maintained component inventory.

Before adding an interface, answer:

1. What task does it enable that CLI, MCP, Skills, Storybook, or Registry cannot already perform?
2. Can it read only the entries needed for the current task?
3. Does it expose a bounded schema?
4. Is it read-only by default?
5. Can it be tested without a model?
6. Does it preserve exact package versions and public imports?
7. Can stale output be detected in CI?

## Failure policy

The system fails closed when:

- a stable ID is unknown;
- a component prop cannot be found in the installed contract;
- generated files are stale;
- a Registry target conflicts or escapes the project root;
- a Skill has invalid metadata or broken references;
- a Story ID is missing or ambiguous;
- a Figma component still has a placeholder mapping at publish time;
- evaluation release modes regress below their quality gate.

It never returns invented fallback APIs to make a generation task appear successful.
