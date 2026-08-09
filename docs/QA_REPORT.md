# AI-native Commonspace UI verification report

## 1. Scope

This report records the verification performed for the standalone Commonspace UI repository after the AI-operable design-system upgrade.

The verified source includes:

- the existing publishable React packages for tokens, theme, icons, general UI, and social presentation;
- a canonical, versioned knowledge catalog adjacent to component source;
- generated `DESIGN.md`, `llms*.txt`, component documents, pattern documents, and machine-readable manifests;
- a deterministic local CLI;
- six portable Agent Skills;
- a Model Context Protocol server with bounded generic tools;
- a checksum-verified Registry and guarded scaffold operation;
- Storybook MCP configuration and generated Story contracts;
- a deterministic agent-evaluation harness;
- generated Figma Code Connect templates and a fail-closed publication gate;
- repository governance, release-readiness, and architecture checks.

This report distinguishes four categories:

1. **Executed positive checks** that passed in the current environment.
2. **Executed negative checks** that correctly rejected incomplete or unsafe publication.
3. **Generated artifacts** whose reproducibility was checked byte-for-byte.
4. **Dependency-aware checks not executed** because the npm registry was unavailable.

## 2. Implemented architecture

The AI interfaces do not maintain independent copies of design-system knowledge. The dependency direction is:

```text
component source + tokens + stories + adjacent *.docs.ts
                         │
                         ▼
              @commonspace/knowledge
                         │
            deterministic generated catalog
                         │
       ┌─────────────────┼──────────────────┐
       ▼                 ▼                  ▼
      CLI               MCP            generated docs
       │                 │          DESIGN.md / llms / manifests
       ├──────────────┬──┴───────────────┐
       ▼              ▼                  ▼
   Registry       Agent Skills       Agent evals
                                           │
                                           ▼
                              Storybook and Figma contracts
```

The MCP layer is intentionally thin. It reads the same catalog and invokes the same project-detection, composition, validation, and Registry services used by the CLI.

## 3. Repository implementation milestones

The feature branch was implemented as a sequence of reviewable commits:

```text
76df9f9  docs: plan ai-native design system upgrade
ece32a1  feat: add canonical design-system knowledge model
def641c  feat: generate portable agent design context
8a5effb  feat: add deterministic Commonspace CLI
519d630  feat: add portable Commonspace Agent Skills
9bddf0d  feat: add read-only Commonspace MCP server
5922761  feat: add guarded Commonspace Registry actions
7dcb54e  feat: connect Storybook MCP and catalog contracts
0bd74f5  feat: add Commonspace agent evaluation harness
eff34f4  feat: add Figma Code Connect integration
fdd034e  feat: derive component API contracts from source
fbed840  docs: define AI-operable design system workflows
fc06d1a  chore: enforce AI context and release governance
33a971b  fix: emit runnable JavaScript package imports
1db3b2d  docs: refresh AI-native design system preview
40d0515  feat: add project-scoped validation configuration
```

## 4. Verified inventory

The generated and source contracts currently contain:

```text
publishable packages                 11
knowledge entries                    44
├─ components                        32
├─ product patterns                   6
├─ Registry templates                 5
└─ migration guides                   1

component Story contracts            32
generated agent documents             46
Agent Skills                            6
MCP resources                          49
├─ base resources                      5
└─ catalog-entry resources            44
MCP tools                               6
MCP prompts                             4
Registry templates                      5
agent evaluation scenarios              6
Figma Code Connect templates           32
Figma mappings ready for publish        0
Figma mappings intentionally blocked   32
```

The six MCP tools are deliberately generic rather than component-specific:

```text
commonspace_project_info
commonspace_search
commonspace_get
commonspace_compose
commonspace_validate
commonspace_scaffold
```

## 5. Reproducible generation

### Command

```bash
npm run agent:generate
```

### Executed result

```text
44 knowledge entries generated
32 component entries generated
5 Registry templates generated
32 Storybook contracts generated
46 agent documents generated
6 Agent Skills inspected
6 evaluation scenarios generated
32 Figma Code Connect templates generated
```

After generation:

```text
git status --short   no changes
git diff --check     passed
```

This demonstrates that committed generated artifacts are reproducible from the canonical source metadata.

## 6. Pure logic and architecture tests

### Command

```bash
npm run test:pure
```

### Executed result

```text
package and domain tests      60 / 60 passed
architecture-tool tests       16 / 16 passed
total                         76 / 76 passed
failed                         0
skipped                        0
```

### Covered behavior

The tests cover, among other contracts:

- exact project and package-version detection;
- deterministic catalog search and entry lookup;
- bounded composition planning;
- project-scoped exclusions and allowed public entrypoints;
- rejection of private package imports;
- rejection of hardcoded visual values;
- dry-run-by-default scaffolding;
- Registry checksum stability;
- path traversal, source escape, symlink escape, and overwrite protection;
- knowledge-catalog duplicate and reference validation;
- compiler-derived public prop contracts;
- deterministic generated documents;
- MCP resource, tool, prompt, and error behavior;
- unknown resource and unknown component fail-closed behavior;
- Figma manifest coverage and placeholder rejection;
- semantic icon uniqueness;
- design-token invariants;
- theme persistence sanitization;
- feedback queue validation, deduplication, eviction, and dismissal;
- AI contract inspection failure when generated context is missing;
- emitted TypeScript source imports being rewritten from `.ts` to runnable `.js` paths;
- CSS namespace enforcement;
- Markdown relative-link and fenced-code-block validation;
- Agent Skill metadata and reference validation;
- Storybook ID and named-story extraction.

## 7. Full static verification gate

### Command

```bash
npm run verify
```

### Executed result

```text
knowledge entries                    44 verified
Registry templates                    5 verified
Storybook contracts                  32 verified
agent documents                      46 verified
Agent Skills                           6 verified
evaluation scenarios                   6 verified
Figma templates                       32 verified
AI cross-contract gate                 passed
publishable package contracts      11 / 11 passed
package dependency boundaries          passed
public export maps                      passed
CSS namespace files                  7 / 7 passed
Markdown documents                     89 passed
TypeScript syntax/no-check gate          passed
```

The AI cross-contract gate verified the following relationships:

```text
44 catalog entries
32 Story IDs
6 Skill manifests
6 MCP tools
5 Registry templates
6 eval scenarios
32 Figma mappings
```

## 8. Project-scoped CLI validation

### Command

```bash
npm run commonspace -- validate --path . --json
```

### Executed result

```json
{
  "filesScanned": 211,
  "issues": [],
  "summary": {
    "errors": 0,
    "warnings": 0
  }
}
```

The validation uses `commonspace.config.json`. Generated agent artifacts, documentation, tests, scripts, generated knowledge, and deterministic eval fixtures are excluded from product-source policy checks. The AI infrastructure packages are listed as explicit public entrypoints rather than being mistaken for private imports.

## 9. Registry write safety

Registry actions are guarded by these rules:

- default mode is `dry-run`;
- write mode requires `--apply` or `apply: true`;
- every template file is checked against its SHA-256 manifest;
- existing different files are not overwritten;
- absolute paths and path traversal are rejected;
- source paths cannot escape the Registry package;
- target paths cannot escape the selected project root;
- symlink escape is rejected;
- the plan lists every file before a write occurs.

The CLI and MCP call the same Registry domain service, so write semantics do not diverge between interfaces.

## 10. Static visual preview

### Command

```bash
npm run preview:capture
```

### Executed result

```text
viewport                    1440 × 1000
capture                     docs/preview/captures/commonspace-ui-overview.png
broken images               0
console or page errors       0
horizontal overflow          false
document scroll size        1440 × 1352
```

The preview is a static repository-owned product overview. It verifies the documented visual surface and generated assets, but it is not a substitute for the dependency-aware Storybook browser suite.

## 11. Agent evaluation harness

The repository contains six deterministic reference scenarios:

```text
no context                  score 27   fail
generated DESIGN.md         score 79   fail
Skill                       score 93   fail
MCP                         score 100  pass
Skill + MCP                 score 100  pass
Skill + MCP + Storybook     score 100  pass
```

Summary:

```text
scenarios                    6
passing                      3
failing                      3
average score               83.17
```

These are **deterministic fixture-based contract evaluations**, not live benchmark runs against external language models. They prove that the evaluator identifies private imports, invented props, hardcoded values, missing Commonspace components, inaccessible controls, and missing states. They do not by themselves establish real-world model quality. The harness is designed so real agent outputs can later be added as captured evaluation fixtures.

## 12. Expected negative gate: Figma publication

### Command

```bash
npm run figma:publish-check
```

### Executed result

```text
exit code                    1, expected
placeholder mappings         32
publishable mappings          0
```

The command rejected every generated placeholder until a reviewed Figma component node URL is provided. This is intentional. Code Connect templates, public imports, Story IDs, and source paths are generated, but no fictitious Figma connection is represented as complete.

## 13. Expected negative gate: public package release

### Command

```bash
npm run release:check
```

### Executed result

```text
exit code                    1, expected
```

The release gate correctly rejected public publication because:

- the repository license is still `UNLICENSED`;
- `pnpm-lock.yaml` is absent;
- all 11 publishable packages remain `UNLICENSED`.

The project does not select a public license on the user's behalf.

## 14. Dependency installation attempt

### Command

```bash
corepack pnpm install --no-frozen-lockfile
```

### Executed result

```text
failed before dependency installation
DNS error: EAI_AGAIN registry.npmjs.org
requested package-manager archive: pnpm 11.4.0
```

No lockfile or partial dependency tree was generated.

## 15. Dependency-aware checks not represented as passing

Because dependencies could not be installed, this report does **not** claim that the following passed:

```text
full workspace typecheck with vendor declarations
Vite library production builds
Vite playground build
agent-lab Vite build
consumer-fixture build from package dist/exports
Storybook static build
Storybook MCP transport startup
Storybook browser interaction tests
Storybook browser accessibility tests
MCP stdio transport startup with the official SDK
Figma CLI parse
Figma CLI preview
package tarball inspection
npm publication
```

Configuration and CI steps exist for these checks, but they remain release-blocking until run in a network-enabled environment.

## 16. Current release decision

The repository is suitable for:

- continued design-system development;
- internal source distribution;
- deterministic AI context generation;
- local CLI search, composition, validation, and guarded scaffolding using the checked-in source;
- Agent Skill installation and review;
- MCP domain and protocol integration development;
- adding real agent output fixtures to the evaluation harness;
- preparing reviewed Figma Code Connect mappings.

The repository is **not approved for public npm publication** until all of the following are complete:

1. choose and review an explicit repository and package license;
2. install dependencies and commit a reviewed `pnpm-lock.yaml`;
3. pass full typecheck and all Vite package builds;
4. pass the consumer fixture against built `dist` exports;
5. pass Storybook static, interaction, and accessibility tests;
6. inspect package tarballs;
7. replace Figma placeholders with reviewed node URLs before Code Connect publication.

## 17. Final commands

The source-only verification set is:

```bash
npm run agent:generate
npm run test:pure
npm run verify
npm run commonspace -- validate --path . --json
npm run preview:capture
git diff --check
```

The expected publication blockers are:

```bash
npm run figma:publish-check  # expected to fail until real Figma nodes exist
npm run release:check        # expected to fail until license and lockfile exist
```

The dependency-aware release set, to be run later in an environment with registry access, is:

```bash
corepack pnpm install
pnpm typecheck
pnpm build
pnpm test
pnpm --filter @commonspace/docs build-storybook
pnpm --filter @commonspace/consumer-fixture build
npm run figma:parse
npm run figma:preview
```
