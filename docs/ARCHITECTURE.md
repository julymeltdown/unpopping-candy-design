# Architecture

## Purpose

Commonspace UI is a standalone design-system repository and an AI-operable knowledge platform. Its architecture preserves six properties:

1. visual packages can be installed independently;
2. presentational packages do not acquire application dependencies;
3. public contracts are represented by exports, TypeScript, tokens, states, metadata, and stories;
4. every human and AI interface reads one versioned knowledge graph;
5. automated write actions are explicit, bounded, and reviewable;
6. generated context can be verified for staleness without a model or network.

## Runtime package graph

```text
                         ┌──────────────────────┐
                         │ @commonspace/theme   │
                         └──────────▲───────────┘
                                    │
┌──────────────────────┐            │
│ @commonspace/tokens  │────────────┼──────────────────────────┐
└──────────▲───────────┘            │                          │
           │                        │                          │
           │              ┌─────────┴─────────┐                │
           └──────────────│ @commonspace/ui   │◀──────┐        │
                          └─────────▲─────────┘       │        │
                                    │                 │        │
                          ┌─────────┴─────────┐       │        │
                          │@commonspace/social│───────┘        │
                          └───────────────────┘                │
                                                              │
                          ┌────────────────────┐               │
                          │@commonspace/icons  │───────────────┘
                          └────────────────────┘
```

Effective runtime dependencies:

```text
tokens  → no dependencies
theme   → React + tokens
icons   → React + Ant Design Icons
ui      → React + tokens + icons
social  → React + tokens + icons + ui
```

## AI knowledge plane

```text
component source + adjacent metadata + tokens + stories + patterns + templates
                                   │
                                   ▼
                         @commonspace/knowledge
                                   │
       ┌───────────────┬───────────┼───────────┬─────────────────┐
       ▼               ▼           ▼           ▼                 ▼
@commonspace/cli  generated docs  manifests  Registry metadata  Figma templates
       │                           │           │                 │
       ├───────────────┬───────────┘           │                 │
       ▼               ▼                       ▼                 ▼
 Agent Skills    @commonspace/mcp         safe scaffold    Code Connect gate
       │               │
       └───────┬───────┘
               ▼
     generated consumer source
               │
      ┌────────┼───────────────┐
      ▼        ▼               ▼
 Storybook  static evals  consumer build
```

Effective AI-tooling dependencies:

```text
knowledge → no runtime framework or network dependencies
registry  → knowledge + Node filesystem/crypto
cli       → knowledge + registry + Node project inspection
mcp       → knowledge + cli + registry + tokens + MCP SDK + Zod
evals     → knowledge
figma     → knowledge
```

## Why application concerns are excluded

The source application uses JWT authentication, TanStack Query, SWR, Zustand, React Router, Feature-Sliced Design, and backend services. Bundling those with visual components would force unrelated decisions on consumers and make package versions depend on application runtime.

The following remain outside this repository:

```text
authentication and authorization
API clients and generated DTOs
remote-state caches
client workflow stores
routing
application feature slices
backend services
```

AI tooling does not alter that boundary. MCP and CLI can inspect a consumer project and recommend components, but visual packages still do not own application data or business behavior.

## Presentation models

The social package uses presentation models that describe only what a component needs to render and which viewer states it exposes. They are not persistence entities or wire contracts.

```text
API response
→ consuming application's entity mapper
→ Commonspace presentation model
→ social component
```

This permits the same component to work with REST, GraphQL, local fixtures, Firebase, or another source.

## Canonical knowledge model

A component contract is assembled from two sources.

### Compiler-derived source

- component name;
- public prop names;
- prop types and requiredness;
- native element and inherited native props;
- public source path.

### Human-authored adjacent metadata

- summary and semantic responsibility;
- when to use and avoid;
- variants and state guidance;
- accessibility requirements;
- tokens;
- composition relationships;
- preferred and discouraged examples;
- Story IDs;
- Figma metadata.

The compiler combines both into a stable `KnowledgeCatalog` and rejects duplicate IDs, broken references, unsafe metadata, and inconsistent package contracts.

## Generated context

The following outputs are generated, committed, and checked for staleness:

```text
DESIGN.md
agent/llms*.txt
agent/components/*.md
agent/patterns/*.md
agent/manifests/*.json
figma/code-connect/*.figma.ts
figma/manifest.json
docs/agent-evals/baseline.md
```

Generated files are not hand-edited. The source, adjacent metadata, story, pattern, template, migration, or generator is changed instead.

## Public API

The public API consists of:

- package names and declared subpath exports;
- emitted TypeScript declarations;
- component props and callbacks;
- semantic design tokens;
- documented `data-cs-*` attributes;
- documented behavior and accessibility semantics;
- stable knowledge IDs;
- stable Storybook contract IDs where documented;
- CLI command and MCP tool schemas;
- Registry template IDs and variable contracts.

The following are internal:

- `src` paths;
- internal file names;
- undocumented DOM nesting;
- internal classes not identified as extension points;
- backing Ant Design icon names;
- bundler chunk names;
- generator implementation details;
- template source locations beyond the Registry manifest.

## Build model

Publishable packages build ESM output to `dist`.

```text
source TypeScript / TSX
→ Vite or TypeScript package build
→ declaration generation
→ static CSS/JSON/template asset copy
→ package exports resolve only to dist
```

React and React DOM remain external peer dependencies for React packages.

## Consumer acceptance model

The Vite playground aliases source for fast design-system development. It does not prove published-package correctness.

The consumer fixture is the acceptance boundary:

```text
built package dist
→ package.json exports
→ consumer Vite resolver
→ consumer typecheck and build
```

No source alias is permitted in that app.

## AI operational interfaces

### CLI

Local, deterministic, JSON-friendly operations:

```text
project detection
catalog list/search/get
composition planning
source validation
installation diagnosis
Registry dry-run/apply
```

### MCP

A thin protocol adapter over the same domain services. The tool surface is bounded and general. Component growth increases resources, not tool count.

### Skills

Workflow procedures using progressive disclosure. Skills do not embed a second component inventory.

### Registry

Checksummed files and explicit variables. Dry-run is the default; apply is explicit and conflict-safe.

### Storybook

The browser-executable source of component state, interaction, and accessibility evidence.

### Evals

A deterministic static quality gate for generated source. It is not a replacement for typecheck or browser tests.

### Figma

Generated mapping templates. Publication fails until real component nodes replace placeholders.

## Static architecture gates

### Package manifest contract

All publishable packages must expose `dist`, declare licensing and publication metadata, use ESM, include package documentation, and define build, test, and typecheck scripts.

### Dependency boundary contract

The scanner parses static, side-effect, export, and dynamic imports and compares them with each package's allowed dependencies. It also scans for forbidden runtime patterns.

### Export contract

Every JavaScript entry point exposes an ESM implementation and declaration file. CSS and JSON assets must have corresponding source assets. Export targets may not reference `src`.

### CSS contract

Custom properties and public classes use Commonspace namespaces. Scanner behavior is protected by regression tests.

### Documentation contract

Repository-relative links must resolve inside the repository and fenced code blocks must be balanced.

### AI cross-interface contract

The AI verifier checks catalog completeness, component operational guidance, manifest count agreement, deterministic timestamps, configuration paths, bounded MCP tools, and canonical prop ownership.

### Release-readiness contract

Public release fails while the repository is unlicensed, package manifests remain `UNLICENSED`, or a reviewed lockfile is missing.

## Changes and compatibility

A compatibility assessment is required when changing:

- a component prop or callback;
- a presentation model field;
- a token name or meaning;
- a package export;
- accessibility behavior;
- a documented state attribute;
- required style import order;
- a stable knowledge ID;
- a CLI or MCP schema;
- a Registry template path or variable;
- an evaluation release threshold.

Changesets records affected packages and SemVer impact. Generated-document wording alone is not necessarily a package release, but source metadata or API changes generally are.
