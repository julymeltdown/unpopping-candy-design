# Commonspace UI

**Commonspace UI is a publishable React design system and an AI-operable knowledge platform for building social, content, moderation, and collaboration interfaces.**

It combines five conventional design-system packages with a structured knowledge compiler, deterministic CLI, Agent Skills, a compressed MCP server, a checksum-backed template Registry, Storybook contracts, agent-output evaluations, and Figma Code Connect templates.

![Commonspace UI component overview](./docs/preview/captures/commonspace-ui-overview.png)

## What this repository is

Commonspace UI is designed to support two equally important consumers.

```text
Human developers and designers
→ install packages
→ read Storybook and typed APIs
→ compose components and product patterns
→ test and release

AI agents
→ detect the current project and package versions
→ search the exact installed catalog
→ inspect valid components, props, states, and tokens
→ compose a bounded implementation plan
→ scaffold approved templates
→ create stories and run validation
→ evaluate generated source
→ connect implementation to Figma components
```

The core proposition is not “put a large Markdown file in the prompt.” It is:

> Write component intent once beside the source, derive machine-readable contracts from the public API, and expose the same versioned knowledge through every human and AI interface.

## What this repository is not

Commonspace UI is not:

- an application framework;
- an authentication or authorization system;
- a data-fetching abstraction;
- a Router wrapper;
- a Zustand, TanStack Query, or SWR opinion;
- a backend API contract;
- a remote code-generation service;
- a general-purpose clone of Ant Design's entire component catalogue;
- a claim that static metadata replaces visual design review.

Application state, API calls, routing, JWTs, server entities, and business workflows remain in the consuming application.

---

# Status at a glance

| Area | Current status |
|---|---|
| Layered design tokens | Implemented |
| Scoped light, dark, system, high-contrast themes | Implemented |
| Semantic Ant Design icon wrappers | Implemented |
| General React UI components | Implemented |
| API-independent social presentation components | Implemented |
| Storybook documentation and component contracts | Implemented |
| Canonical structured knowledge catalog | Implemented |
| Generated `DESIGN.md`, `llms*.txt`, and JSON manifests | Implemented |
| Deterministic local CLI | Implemented |
| Portable Agent Skills | Implemented |
| Read-oriented MCP resources and tools | Implemented |
| Guarded Registry scaffolding | Implemented |
| Static agent-output evaluation harness | Implemented |
| Agent Lab evaluation viewer | Implemented |
| Figma Code Connect template generation | Implemented |
| Real Figma component-node mappings | **Not configured; publish gate intentionally fails** |
| Dependency lockfile | **Not committed yet** |
| Public npm publication | **Blocked by UNLICENSED repository status** |
| Full dependency-aware build in this delivery environment | Verified only if dependency installation succeeds; see QA report |

Canonical catalog inventory:

```text
44 knowledge entries
├─ 32 public components
├─ 6 product patterns
├─ 5 Registry templates
└─ 1 migration record

32 Storybook contract stories
6 Agent Skills
6 general MCP tools
5 Registry templates
6 deterministic agent-evaluation scenarios
32 generated Figma Code Connect templates
```

---

# Repository architecture

```text
commonspace-ui/
├─ apps/
│  ├─ docs/                    Storybook documentation and MCP endpoint
│  ├─ playground/              source-linked Vite development app
│  ├─ consumer-fixture/        built-package/export acceptance app
│  └─ agent-lab/               agent-evaluation dashboard
│
├─ packages/
│  ├─ tokens/                  reference, semantic, and component tokens
│  ├─ theme/                   scoped theme and density provider
│  ├─ icons/                   semantic Ant Design icon wrappers
│  ├─ ui/                      general styled React components
│  ├─ social/                  API-independent social product patterns
│  ├─ knowledge/               canonical metadata and generators
│  ├─ registry/                checksum-backed templates and safe scaffolding
│  ├─ cli/                     deterministic project, discovery, compose, validate CLI
│  ├─ mcp/                     thin Model Context Protocol adapter
│  ├─ evals/                   deterministic generated-source quality evaluation
│  └─ figma/                   Code Connect manifest and template generation
│
├─ skills/                     portable Agent Skills and focused references
├─ agent/
│  ├─ components/              generated component documents
│  ├─ patterns/                generated pattern documents
│  ├─ manifests/               canonical machine-readable outputs
│  ├─ mcp/                     client configuration examples
│  └─ llms*.txt                portable context surfaces
│
├─ figma/
│  ├─ code-connect/            generated `.figma.ts` templates
│  ├─ commonspace.figma.json   mapping configuration
│  └─ manifest.json            connection status
│
├─ schemas/                    Commonspace configuration JSON Schema
├─ docs/                       architecture, workflows, ADRs, QA, publishing
├─ scripts/                    generators and deterministic gates
├─ tests/architecture/         verifier regression tests
├─ commonspace.config.json     local AI integration map
├─ AGENTS.md                   mandatory agent operating contract
└─ DESIGN.md                   generated portable design contract
```

## Runtime package graph

```text
@commonspace/tokens
    ├──────────────→ @commonspace/theme
    ├──────────────→ @commonspace/icons
    ├──────────────→ @commonspace/ui
    └──────────────→ @commonspace/social

@commonspace/icons ───────────→ @commonspace/ui
@commonspace/icons ───────────→ @commonspace/social
@commonspace/ui ──────────────→ @commonspace/social
```

## AI knowledge plane

```text
public TypeScript API
component-adjacent *.docs.ts
semantic tokens
product pattern metadata
Registry templates
Storybook contract stories
                 │
                 ▼
       @commonspace/knowledge
                 │
   ┌─────────────┼───────────────┬────────────────┐
   ▼             ▼               ▼                ▼
DESIGN.md     llms files     JSON manifests   component docs
   │             │               │                │
   └─────────────┴─────────┬─────┴──────────┬─────┘
                           ▼                ▼
                  @commonspace/cli   @commonspace/registry
                           │                │
                           ├────────┬───────┤
                           ▼        ▼       ▼
                       Skills     MCP    scaffold
                           │        │
                           └───┬────┘
                               ▼
                   generated application source
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
          Storybook MCP   agent evaluations  Figma mapping
```

See [AI context architecture](./docs/AI_CONTEXT_ARCHITECTURE.md).

---

# Quick start for React consumers

## Installation

The packages are currently source-complete but not publicly published. In a workspace or internal Registry, install the packages required by the interface.

```bash
pnpm add \
  @commonspace/tokens \
  @commonspace/theme \
  @commonspace/icons \
  @commonspace/ui
```

For social product patterns:

```bash
pnpm add @commonspace/social
```

React and React DOM are peer dependencies.

```text
react      >=18.3 <20
react-dom  >=18.3 <20
```

## Required styles

Import global package styles once at the application entry.

```tsx
import '@commonspace/tokens/styles.css';
import '@commonspace/icons/styles.css';
import '@commonspace/ui/styles.css';
import '@commonspace/social/styles.css';
```

The `social` stylesheet is only required when using `@commonspace/social`.

## Provider

```tsx
import { CommonspaceProvider } from '@commonspace/theme';

export function Root() {
  return (
    <CommonspaceProvider
      scope="document"
      theme="system"
      density="comfortable"
      accent="blue"
    >
      <App />
    </CommonspaceProvider>
  );
}
```

## General UI

```tsx
import {
  Alert,
  Button,
  Stack,
  TextField,
} from '@commonspace/ui';

export function ProfileSettings() {
  return (
    <form aria-label="Profile settings">
      <Stack gap="md">
        <Alert
          tone="neutral"
          title="Public information"
          description="Changes appear beside your published work."
        />
        <TextField
          label="Display name"
          description="Use the name readers should recognize."
        />
        <Button type="submit">Save profile</Button>
      </Stack>
    </form>
  );
}
```

Stable subpath imports are also available.

```tsx
import { Button } from '@commonspace/ui/button';
import { Stack, Inline } from '@commonspace/ui/layout';
```

Private imports are not supported.

```tsx
// Invalid
import { Button } from '@commonspace/ui/src/button/button';
```

## Social presentation components

`@commonspace/social` consumes presentation models and callbacks. It does not fetch data, mutate a cache, navigate, or read authentication state.

```tsx
import {
  PostCard,
  type SocialPostViewModel,
} from '@commonspace/social/post';

const post: SocialPostViewModel = mapApiPost(apiPost);

<PostCard
  post={post}
  onOpenPost={() => navigate(`/posts/${post.id}`)}
  onOpenAuthor={() => navigate(`/users/${post.author.handle}`)}
  onReply={() => openReplyComposer(post.id)}
  onLike={() => likePost(post.id)}
  onRepost={() => repostPost(post.id)}
  onBookmark={() => bookmarkPost(post.id)}
/>;
```

Data boundary:

```text
REST / GraphQL / Firebase / local fixture
→ consumer entity mapper
→ Commonspace presentation model
→ social component
```

---

# Packages

## `@commonspace/tokens`

Provides reference, semantic, and component token layers.

### Reference tokens

Raw scales for:

- neutral and chromatic colors;
- spacing;
- radius;
- typography;
- elevation;
- motion;
- component dimensions.

### Semantic tokens

Public intent-based variables include:

```css
--cs-canvas
--cs-surface
--cs-surface-muted
--cs-ink
--cs-ink-muted
--cs-border
--cs-accent
--cs-positive
--cs-warning
--cs-critical
--cs-focus-ring
```

### Component tokens

```css
--cs-button-height-sm
--cs-button-height-md
--cs-field-height
--cs-dialog-width-md
```

### Consumption

```tsx
import '@commonspace/tokens/styles.css';
import {
  referenceColors,
  semanticTokenNames,
  componentDimensions,
} from '@commonspace/tokens';
import tokens from '@commonspace/tokens/tokens.json';
```

## `@commonspace/theme`

Provides scoped theme behavior without forcing CSS-in-JS.

Supported theme values:

```text
light
dark
system
high-contrast
```

Supported density values:

```text
comfortable
compact
```

Supported accent values:

```text
blue
violet
neutral
```

Local scope:

```tsx
<CommonspaceProvider theme="dark" density="compact" accent="violet">
  <MediaWorkspace />
</CommonspaceProvider>
```

Consumer overrides:

```tsx
<CommonspaceProvider
  variables={{
    '--cs-accent': '#0057ff',
    '--cs-button-height-md': '42px',
  }}
>
  <App />
</CommonspaceProvider>
```

The package sanitizes persisted values and supplies a safe bootstrap script to reduce first-paint theme flashes.

See [Theming](./docs/THEMING.md).

## `@commonspace/icons`

Wraps Ant Design Icons behind semantic product names.

```tsx
import {
  BookmarkIcon,
  HeartIcon,
  ReplyIcon,
  RepostIcon,
  SearchIcon,
} from '@commonspace/icons';
```

Consumers do not depend on Ant Design source names. The backing icon can change without changing the semantic Commonspace import.

The icon contract includes:

- semantic name uniqueness;
- source-name uniqueness;
- `sm`, `md`, `lg`, and numeric sizes;
- decorative `aria-hidden` behavior;
- accessible labels for meaningful standalone icons.

## `@commonspace/ui`

General styled React components.

| Area | Components |
|---|---|
| Actions | `Button`, `IconButton` |
| Identity | `Avatar`, `Badge` |
| Forms | `TextField`, `TextArea` |
| Overlay | `Dialog` |
| Navigation | `Tabs` |
| Feedback | `Alert`, `Toast`, `ToastViewport`, `FeedbackProvider` |
| Loading | `Skeleton`, `Spinner` |
| Layout | `Container`, `Stack`, `Inline`, `Surface`, `Separator` |
| Accessibility | `EmptyState`, `VisuallyHidden` |

Public components expose native props and refs where appropriate, plus documented `data-cs-*` state attributes.

### Feedback queue

The feedback system supports:

```text
neutral
success
warning
critical
```

Queue behavior:

- default maximum of four visible items;
- deduplication by key;
- repeat count;
- critical-item preservation;
- persistent critical feedback by default;
- bounded transient duration;
- deterministic dismissal;
- timer cleanup on provider unmount;
- runtime validation of title, tone, duration, action, and identity.

## `@commonspace/social`

API-independent social product patterns.

| Area | Components |
|---|---|
| Post | `PostCard`, `PostHeader`, `PostMediaGrid`, `PostActions`, `PostCardSkeleton` |
| Composer | `PostComposerView` |
| Timeline | `TimelineView` |
| Profile | `ProfileHeader`, `UserCell` |
| Notifications | `NotificationItem` |
| Messaging | `ConversationPreview` |

This package is intentionally forbidden from importing:

```text
fetch
TanStack Query
SWR
Zustand
React Router
JWT or auth contracts
backend API DTOs
Authorization headers
```

## `@commonspace/knowledge`

Canonical typed design-system knowledge.

It provides:

- component, pattern, template, and migration types;
- catalog construction and validation;
- deterministic search;
- component API extraction from TypeScript source;
- generated portable documents;
- stable JSON serialization;
- the bundled catalog.

```ts
import {
  bundledCatalog,
  getCatalogEntry,
  searchCatalog,
} from '@commonspace/knowledge';
```

It has no React runtime and performs no network requests.

## `@commonspace/registry`

Versioned templates with deterministic SHA-256 manifests and guarded local scaffolding.

```ts
import { bundledCatalog } from '@commonspace/knowledge';
import { createRegistryService } from '@commonspace/registry';

const registry = createRegistryService({
  catalog: bundledCatalog,
  templateRoot: new URL('./templates', import.meta.url).pathname,
});

const plan = await registry.scaffold({
  templateId: 'template.social-feed-page',
  projectRoot: process.cwd(),
  mode: 'dry-run',
});
```

See [Registry](./docs/REGISTRY.md).

## `@commonspace/cli`

Deterministic project inspection, search, composition, validation, and scaffold interface.

```bash
commonspace info --json
commonspace search "profile settings" --json
commonspace get ui.button --json
commonspace compose "moderation queue" --json
commonspace validate . --json
commonspace doctor --json
```

See [CLI](./docs/CLI.md).

## `@commonspace/mcp`

Local MCP server over the same catalog and operational services used by CLI.

```json
{
  "mcpServers": {
    "commonspace": {
      "command": "npx",
      "args": ["-y", "@commonspace/mcp@0.2.0"]
    }
  }
}
```

It exposes general project, search, get, compose, validate, and scaffold tools rather than one tool per component.

See [MCP](./docs/MCP.md).

## `@commonspace/evals`

Deterministic source evaluation against the exact catalog.

```ts
import { bundledCatalog } from '@commonspace/knowledge';
import { evaluateAgentOutput } from '@commonspace/evals';

const report = evaluateAgentOutput(bundledCatalog, scenario);
```

See [Agent evaluations](./docs/AGENT_EVALS.md).

## `@commonspace/figma`

Generates Code Connect manifests and parserless `.figma.ts` templates from the component catalog.

```bash
npm run figma:generate
npm run figma:check
npm run figma:publish-check
```

The publish check intentionally fails until real Figma node URLs replace placeholders.

See [Figma integration](./docs/FIGMA.md).

---

# AI-agent workflow

## 1. Project detection

```bash
npm run commonspace -- info --path . --json
```

Example information:

```text
framework
package manager
installed @commonspace package versions
source roots
configuration path
required style imports already present
```

## 2. Discovery

```bash
npm run commonspace -- search "social profile" --json
npm run commonspace -- compose \
  "social profile with loading, error, empty, and editable states" \
  --json
```

## 3. Exact contract inspection

```bash
npm run commonspace -- get social.profile-header --json
npm run commonspace -- get pattern.profile-surface --json
```

The component record includes exact public props, entrypoints, variants, states, tokens, accessibility requirements, preferred examples, and Story IDs.

## 4. Implementation

The agent uses public imports and keeps application state outside presentation packages.

## 5. Storybook

Create or update stories for every applicable state and use Storybook MCP or browser tests to inspect the actual result.

```text
Commonspace MCP
→ select and contract

Storybook MCP
→ browser state, interactions, accessibility
```

## 6. Validation

```bash
npm run commonspace -- validate --path . --json
npm run agent:check
npm run verify
```

## 7. Evaluation

```bash
npm run evals:check
pnpm --filter @commonspace/agent-lab dev
```

The reference baseline is recorded in [Agent evaluation baseline](./docs/agent-evals/baseline.md).

---

# Agent Skills

Included Skills:

```text
commonspace-ui
build-commonspace-interface
migrate-to-commonspace
review-commonspace-interface
author-commonspace-component
connect-commonspace-figma
```

Each Skill uses progressive disclosure. The procedure remains in `SKILL.md`; detailed rules and examples live in references.

The portable inventory is generated at:

```text
agent/manifests/skills.json
```

See [Agent Skills](./docs/AGENT_SKILLS.md).

---

# MCP

## Resources

```text
commonspace://design/current
commonspace://catalog
commonspace://tokens
commonspace://registry
commonspace://project/info
commonspace://components/{id}
commonspace://patterns/{id}
commonspace://templates/{id}
commonspace://migrations/{id}
```

## Tools

```text
commonspace_project_info
commonspace_search
commonspace_get
commonspace_compose
commonspace_validate
commonspace_scaffold
```

## Prompts

```text
build-interface
migrate-interface
review-interface
author-component
```

The write-capable scaffold tool is dry-run by default and requires explicit `apply: true`.

Client configuration examples:

- [MCP setup overview](./agent/mcp/README.md)
- [Claude Desktop](./agent/mcp/claude-desktop.json)
- [VS Code](./agent/mcp/vscode.json)
- [Codex](./agent/mcp/codex.toml)
- [Storybook HTTP MCP](./agent/mcp/storybook-http.json)

---

# Registry templates

```text
template.vite-app-shell
template.profile-settings
template.social-feed-page
template.moderation-workspace
template.fsd-social-shell
```

Dry-run:

```bash
npm run commonspace -- scaffold template.profile-settings \
  --path ../my-app \
  --target src/profile \
  --json
```

Apply:

```bash
npm run commonspace -- scaffold template.profile-settings \
  --path ../my-app \
  --target src/profile \
  --apply \
  --json
```

Security properties:

- no arbitrary remote Registry fetch;
- no executable template hooks;
- no absolute target paths;
- no traversal;
- no symlink escape;
- no partial write on conflict;
- no overwrite;
- deterministic checksums;
- idempotent repeated apply.

---

# Storybook

The docs app contains:

- introduction and foundations;
- component and social-pattern examples;
- 32 dedicated catalog contract stories;
- theme, density, and accent controls;
- accessibility addon;
- Vitest Storybook integration;
- Storybook MCP addon.

```bash
pnpm --filter @commonspace/docs dev
```

Local Storybook:

```text
http://localhost:6006
```

Local Storybook MCP:

```text
http://localhost:6006/mcp
```

Static Story ID verification can run without installing browser dependencies:

```bash
npm run stories:check
```

Browser interaction and accessibility checks still require installed dependencies and a running browser environment.

See [Storybook AI verification](./docs/STORYBOOK_AI.md).

---

# Agent evaluations

The committed reference suite evaluates one profile-settings task with progressively richer context.

| Context | Score | Result |
|---|---:|---|
| No design context | 27 | Fail |
| Generated `DESIGN.md` | 79 | Fail |
| Skill | 93 | Fail |
| MCP | 100 | Pass |
| Skill + MCP | 100 | Pass |
| Skill + MCP + Storybook | 100 | Pass |

These are deterministic fixture scores, not claims about every model or prompt.

Release modes using MCP must have:

```text
0 invalid imports
0 unknown props
0 hardcoded visual values
0 basic accessibility failures
100% expected component recall
100% required state coverage
```

---

# Figma Code Connect

The repository generates one Code Connect template for each public component.

```text
32 public components
→ 32 generated .figma.ts templates
```

The files include exact public imports, preferred examples, source paths, Story IDs, and mapping status.

Current state:

```text
ready mappings        0
placeholder mappings 32
```

This is intentional. The repository has not been given real Figma component node URLs.

```bash
npm run figma:check
```

passes deterministic template validation.

```bash
npm run figma:publish-check
```

must fail until all target mappings are real and reviewed.

---

# Design language

## Visual principle

Commonspace emphasizes content, legibility, and explicit system state over decorative container density.

The visual system uses:

- neutral surfaces;
- a small semantic color set;
- controlled radii;
- typography-led hierarchy;
- borders and spacing before shadows;
- semantic icons;
- visible focus;
- state attributes rather than undocumented class inspection.

## What to avoid

- hardcoded visual values when a token exists;
- one-off gradients or glow effects;
- excessive pills and badges;
- nested cards without information-hierarchy purpose;
- icon-only controls without names;
- ambiguous button copy;
- hidden error or loading states;
- business logic inside visual packages;
- styling against undocumented internal DOM.

The generated portable contract is [DESIGN.md](./DESIGN.md).

---

# Accessibility contract

Public components are expected to support:

- keyboard operation appropriate to the control;
- visible focus;
- accessible names;
- semantic status or alert announcements;
- state communication beyond color;
- reduced-motion preferences;
- high-contrast theme behavior;
- mobile and zoom reflow;
- native element props and refs where applicable.

Component-adjacent metadata records exact requirements. Storybook and browser tests are the executable verification surface.

An agent must not treat static source validation as complete accessibility proof.

---

# Development

## Requirements

```text
Node.js >= 22.13
pnpm 11.4.0
```

## Install

```bash
corepack enable
pnpm install
```

A reviewed `pnpm-lock.yaml` must be committed before public release. Until then CI uses a non-frozen install and the release-readiness gate rejects publication.

## Development apps

```bash
pnpm dev
```

Runs the Vite playground, Storybook, and Agent Lab in parallel.

Individually:

```bash
pnpm --filter @commonspace/playground dev
pnpm --filter @commonspace/docs dev
pnpm --filter @commonspace/agent-lab dev
```

## Build

```bash
pnpm build:packages
pnpm build
```

Full build sequence:

```text
all publishable packages
→ playground
→ agent lab
→ consumer fixture using package exports
→ Storybook static build
```

## Generate AI artifacts

```bash
npm run agent:generate
```

This runs:

```text
knowledge generation
Registry manifest generation
Story contract generation
portable agent document generation
Skill inventory generation
agent evaluation generation
Figma mapping generation
```

Check without writing:

```bash
npm run agent:check
```

## Tests

```bash
npm run test:pure
npm run verify
```

Dependency-aware:

```bash
pnpm typecheck
pnpm build
```

## Common commands

| Command | Purpose |
|---|---|
| `npm run commonspace -- info --json` | Detect project and installed versions |
| `npm run commonspace -- search <query> --json` | Search the exact catalog |
| `npm run commonspace -- compose <request> --json` | Build a bounded component plan |
| `npm run commonspace -- validate --path <path> --json` | Validate a consumer project |
| `npm run knowledge:check` | Verify canonical catalog output |
| `npm run stories:check` | Verify all public Story contracts |
| `npm run skills:check` | Verify portable Skills |
| `npm run evals:check` | Verify agent benchmark and release gate |
| `npm run figma:check` | Verify Code Connect templates |
| `npm run figma:publish-check` | Require all real Figma mappings |
| `npm run ai:check` | Verify cross-interface AI contracts |
| `npm run release:check` | Verify license and lockfile publication prerequisites |
| `npm run preview:capture` | Capture the static visual overview |

---

# Verification architecture

## Pure tests

Pure package tests run through Node's test runner with TypeScript stripping. They cover:

- tokens and theme normalization;
- icon registry uniqueness;
- UI feedback state;
- social formatting;
- knowledge validation and generation;
- source API extraction;
- CLI detection, search, compose, validation, and scaffolding;
- Registry path safety, conflicts, checksums, and idempotency;
- MCP resources, tools, prompts, and guarded actions;
- agent evaluation metrics and release gate;
- Figma template generation and placeholder publication gate.

## Architecture tests

Architecture-tool tests verify the verifiers themselves:

- static import parsing;
- scoped package-name extraction;
- CSS namespace contracts;
- Markdown links and code fences;
- Agent Skill metadata and references;
- Story ID derivation and inspection;
- AI cross-interface contract integrity.

## Generated-context gate

`agent:check` fails when any generated catalog, document, Registry manifest, Story manifest, Skill manifest, evaluation report, or Figma template differs from canonical source.

## Package contract gate

All publishable packages must:

- be ESM;
- publish only declared files;
- expose `dist` rather than `src`;
- provide build, test, and typecheck scripts;
- declare a license field;
- use workspace protocol for internal dependencies;
- include package documentation;
- use a compatible React peer range when applicable.

## Dependency boundary gate

The scanner verifies the explicit package graph and rejects application dependencies in visual packages or network/state dependencies in deterministic AI tooling.

## Public export gate

Every JavaScript export requires:

```text
source entry
ESM dist target
type declaration target
```

CSS and JSON subpath exports require source assets.

## CSS namespace gate

Public classes and custom properties use Commonspace namespaces.

```text
.cs-*
.is-*
--cs-*
```

## Documentation gate

All tracked Markdown files are checked for:

- balanced fenced code blocks;
- valid repository-relative links;
- repository-root containment.

## AI contract gate

The cross-interface verifier checks:

- required AI entry documents and manifests;
- catalog counts and stable IDs;
- component operational metadata;
- Story, Registry, Skill, eval, and Figma count agreement;
- deterministic manifest timestamps;
- valid local integration paths;
- bounded MCP tool surface;
- absence of duplicate evaluator prop hints.

## Consumer fixture

The consumer fixture resolves built package `exports`. It does not use source aliases. Passing the playground build alone is not accepted as package-distribution proof.

---

# Adding a public component

1. Define one reusable responsibility.
2. Implement the component and namespaced CSS.
3. Export it through a documented package entrypoint.
4. Add component-adjacent `*.docs.ts` metadata.
5. Add exact usage, avoidance, state, token, accessibility, and composition guidance.
6. Add a dedicated Storybook contract story.
7. Add non-visual tests.
8. Run:
   ```bash
   npm run agent:generate
   npm run test:pure
   npm run verify
   ```
9. Inspect the generated Figma template.
10. Add a Changeset.

Use the [`author-commonspace-component`](./skills/author-commonspace-component/SKILL.md) Skill and [component guidelines](./docs/COMPONENT_GUIDELINES.md).

---

# Versioning and publication

Changesets controls package SemVer and changelogs.

```bash
pnpm changeset
pnpm version-packages
```

Recommended release levels:

```text
patch  compatible defect fix
minor  compatible component, token, pattern, or AI-interface addition
major  breaking export, prop, token, behavior, or accessibility change
```

Public npm publication is currently blocked because:

1. the repository is `UNLICENSED`;
2. no reviewed `pnpm-lock.yaml` is committed;
3. dependency-aware package, consumer, Storybook, and browser gates must pass in the release environment;
4. package tarballs must be inspected;
5. the npm organization, provenance, and release environment must be configured.

The release workflow is manual and protected. It runs `release:check` before any publish action.

Figma publication is separate. Package publication does not silently publish placeholder Code Connect mappings.

See [Publishing](./docs/PUBLISHING.md).

---

# Migration from the original social application

The design system was extracted from a React + Vite social-service reference repository. The standalone repository deliberately excludes:

```text
JWT access and refresh logic
Auth API
Social API
TanStack Query
SWR
Zustand
React Router
FSD application slices
backend persistence
```

Recommended application migration order:

```text
1. tokens and theme
2. semantic icons
3. UI primitives
4. global feedback surfaces
5. social presentation models and mappers
6. route-by-route social patterns
7. remove duplicated application CSS
```

See [Migration](./docs/MIGRATION.md).

---

# Governance

## Source-of-truth rule

Do not manually maintain parallel component inventories for CLI, MCP, Skills, Figma, or documentation.

```text
source + adjacent metadata + stories + tokens
→ compiler
→ every human and AI output
```

## AI-interface rule

A new AI integration must query the catalog or a generated manifest. It must be bounded, version-aware, deterministic where possible, read-only by default, and independently testable.

## Write-action rule

Any AI-triggered write must:

- provide a dry-run;
- show every affected path;
- remain inside the project root;
- refuse conflicts;
- require explicit approval;
- be idempotent where possible.

## Evidence rule

Do not claim a build, Storybook, browser, Figma, or publication gate passed unless the exact command ran successfully in the current verification cycle.

Architecture decisions:

- [Separate repository](./docs/adr/0001-separate-design-system-repository.md)
- [Canonical knowledge source](./docs/adr/0002-canonical-knowledge-source.md)
- [Compressed MCP and guarded actions](./docs/adr/0003-compressed-mcp-and-guarded-actions.md)
- [Agent eval and Figma gates](./docs/adr/0004-agent-evals-and-figma-publish-gates.md)

---

# Documentation index

| Document | Purpose |
|---|---|
| [DESIGN.md](./DESIGN.md) | Generated portable design contract |
| [Architecture](./docs/ARCHITECTURE.md) | Package and consumer architecture |
| [AI context architecture](./docs/AI_CONTEXT_ARCHITECTURE.md) | Canonical knowledge and AI interfaces |
| [Theming](./docs/THEMING.md) | Theme, density, accents, overrides |
| [Component guidelines](./docs/COMPONENT_GUIDELINES.md) | Public component authoring contract |
| [CLI](./docs/CLI.md) | Local project, discovery, compose, validate, scaffold interface |
| [MCP](./docs/MCP.md) | MCP resources, tools, prompts, and security |
| [Registry](./docs/REGISTRY.md) | Template distribution and guarded writes |
| [Agent Skills](./docs/AGENT_SKILLS.md) | Portable procedures and validation |
| [Storybook AI](./docs/STORYBOOK_AI.md) | Executable stories and MCP relationship |
| [Agent evaluations](./docs/AGENT_EVALS.md) | Metrics and release gate |
| [Figma](./docs/FIGMA.md) | Code Connect generation and publication gate |
| [Migration](./docs/MIGRATION.md) | Migration from the original application |
| [Publishing](./docs/PUBLISHING.md) | SemVer, release readiness, and tarballs |
| [QA report](./docs/QA_REPORT.md) | Executed and blocked verification |
| [Implementation plan](./docs/plans/2026-08-09-ai-native-design-system.md) | AI-native upgrade plan |

---

# Current limitations

The following are not complete and are not presented as complete:

- real Figma component-node URLs;
- published Code Connect mappings;
- a hosted Commonspace MCP service;
- remote Registry distribution or authenticated private Registry support;
- automated codemods for arbitrary external UI systems;
- browser-level visual regression in this repository environment;
- a model-running evaluation farm across multiple agent providers;
- automatic human-design scoring;
- Figma variable synchronization;
- public npm packages;
- an explicit redistribution license;
- a committed dependency lockfile.

The local AI context, deterministic search and validation, guarded scaffolding, Storybook contracts, static evals, and Figma templates are implemented. External publication and organization-specific Figma mapping remain governed follow-up work.

---

# License

Copyright © 2026. All rights reserved.

This repository is currently marked **UNLICENSED**. No permission is granted to publish, redistribute, sublicense, or sell the packages until the owner selects an explicit license. Internal evaluation and development may proceed under the owner's authorization.

See [LICENSE.md](./LICENSE.md) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
