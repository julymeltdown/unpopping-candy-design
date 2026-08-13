# Publishing

## Current status

Public publication has not been executed. Repository-level prerequisites are configured, while npm organization and release-environment approval remain external steps.

```text
repository license  MIT
package licenses    MIT
pnpm-lock.yaml      committed
npm release         not executed
```

The manual release workflow defaults to evidence-only candidate preparation. It publishes only when the protected `publish` input is explicitly true.

## Preconditions

External publication requires all of the following:

1. the owner selects and reviews an explicit repository license;
2. package manifest license fields are updated consistently;
3. `pnpm install` succeeds from the intended Registry;
4. a reviewed `pnpm-lock.yaml` is committed;
5. generated AI context is current;
6. pure and architecture tests pass;
7. full typecheck passes;
8. all package builds pass;
9. the consumer fixture builds from package exports;
10. Storybook static build and browser tests pass;
11. accessibility and interaction tests pass;
12. package tarballs are inspected;
13. npm organization, provenance, and protected release environment are configured;
14. npm trusted publishing is configured for all nine packages.

Figma Code Connect publication has a separate gate. Placeholder mappings must not be published.

## Release-readiness command

```bash
pnpm release:check
```

It checks at least:

- repository license status;
- package license fields;
- lockfile presence;
- publishable-package status.
- exact Stage 0 gzip bundle ceilings;
- unexpired local npm-namespace and brand authorization evidence.

It does not replace tests, builds, or tarball inspection.

## Changeset workflow

Record every public change:

```bash
pnpm changeset
```

Choose affected packages and bump level:

```text
patch  compatible defect fix
minor  compatible component, token, pattern, template, or AI-tool addition
major  breaking API, token, export, behavior, or accessibility change
```

All nine public packages use one coordinated requested version. A release candidate updates visual packages (`tokens`, `theme`, `icons`, `ui`, and `social`) and AI-operable packages (`knowledge`, `registry`, `cli`, and `mcp`) together, including consistent internal dependency ranges. The two private tooling packages are not publication targets.

## Versioning

```bash
pnpm version-packages
```

Review:

- generated changelogs;
- internal dependency ranges;
- generated documents and manifests;
- migration records;
- README installation examples;
- MCP and CLI advertised versions.

## Ephemeral candidate

Prepare the Stage 0 candidate without editing source manifests, lockfiles, generated compatibility, or Changesets:

```bash
pnpm release:candidate -- --version 0.3.0-alpha.0 --channel next --out .artifacts/releases/stage-0-alpha.0
node scripts/verify-release-candidate.mjs .artifacts/releases/stage-0-alpha.0 --source-commit "$(git rev-parse HEAD)"
```

The command copies a bounded source tree into the ignored output, runs normal Changesets versioning only in that staging tree, rewrites the coordinated public packages to the requested prerelease, refreshes and freezes the staging lockfile, regenerates and validates AI artifacts, packs exactly nine tarballs, and runs the base Vite/React 19/pnpm 11 consumer. `candidate.json` binds every tarball digest, the exact `catalog.json` bytes, and the compatibility receipt to the same source commit. Its `packageTests` status names the staging package-source tests precisely; the source checkout's complete `test:pure` gate remains a separate required check. A failed run removes its incomplete candidate directory.

## Manual release workflow

The GitHub release workflow is manual and protected by the `npm-release` environment.

It executes:

```text
frozen dependency installation
trusted-publishing npm CLI installation
npm namespace and brand authorization
isolated alpha candidate preparation
candidate digest verification
candidate evidence upload
optional next-channel publication
```

The `publish` input defaults to `false`. The `npm-release` environment must require named owner approval. No workflow dispatch, tag, or publication is part of ordinary source preparation.

### Trusted-publisher prerequisites

Before selecting `publish: true`, configure npm trusted publishing for each of the nine `@unpopping-candy/*` public packages with these exact values:

```text
GitHub owner/repository  julymeltdown/unpopping-candy-design
workflow filename        release.yml
environment              npm-release
allowed action           npm publish
```

The workflow uses GitHub-hosted runners, Node 22.16.0, npm 12.0.2, and `id-token: write`. It intentionally defines no `NODE_AUTH_TOKEN` or long-lived npm write secret. The public package manifests must keep their repository URL aligned with this GitHub repository before first publication. Store the schema-v1 authorization JSON as the protected `POPCANDY_RELEASE_AUTHORIZATION` environment secret; the workflow materializes it only at ignored `.artifacts/authorizations/release.json`, validates it, and never uploads or commits it.

### Storybook delivery prerequisites

Storybook verification always runs on pull requests and `master`. Chromatic runs only when `POPCANDY_CHROMATIC_ENABLED` is `true` and `CHROMATIC_PROJECT_TOKEN` exists. Pages deploys only from `master` when `POPCANDY_PAGES_ENABLED` is `true`, through the protected `github-pages` environment. Missing variables or credentials mean the corresponding external delivery does not run and must not be claimed.

## Publish

Stable `latest` publication is not available in Stage 0. It remains owned by the Stage 3 stable release process. The current protected workflow can publish only the verified `0.3.0-alpha.0` tarballs under `next`:

```bash
npm publish <verified-tarball> --provenance --access public --tag next
```

Do not run that command manually unless the same authorization, digest, and protected-environment evidence is present.

## Package inspection

Before first publication and after changes to package files or exports:

```bash
pnpm --filter @unpopping-candy/ui pack
pnpm --filter @unpopping-candy/social pack
pnpm --filter @unpopping-candy/knowledge pack
pnpm --filter @unpopping-candy/cli pack
pnpm --filter @unpopping-candy/mcp pack
```

Inspect every tarball for:

- only `dist`, README, approved templates/fixtures, and notices;
- no source-only private implementation unless explicitly intended;
- no tests or local application fixtures;
- no absolute local paths;
- no secrets;
- valid `exports` targets;
- valid CSS and JSON assets;
- declaration and declaration-map resolution;
- CLI `bin` resolution where applicable;
- bundled Registry templates and checksums where applicable.

## Consumer acceptance

Build packages first, then build `apps/consumer-fixture` without source aliases.

```bash
pnpm build:packages
pnpm --filter @unpopping-candy/consumer-fixture typecheck
pnpm --filter @unpopping-candy/consumer-fixture build
```

The fixture must consume only package exports.

## AI artifact acceptance

```bash
pnpm agent:check
pnpm ai:check
```

Verify:

- generated docs and manifests are current;
- component props match public source;
- every component has a Story contract;
- MCP tool surface remains bounded;
- Registry checksums are current;
- eval release modes pass;
- Figma templates are deterministic.

## Storybook acceptance

```bash
pnpm --filter @unpopping-candy/docs test
pnpm --filter @unpopping-candy/docs build-storybook
```

Inspect the Storybook artifact and ensure the MCP endpoint configuration corresponds to the released docs version.

## Figma publication

Figma mappings are published separately:

```bash
npm run figma:parse
npm run figma:preview
npm run figma:publish-check
npm run figma:publish
```

`figma:publish-check` must fail while any component has a placeholder node URL.

## Release channels

Release channels:

```text
latest   Stage 3 stable releases only
next     verified prerelease candidates
canary   future commit-scoped integration testing
```

Canary packages must still build and be tested from actual tarballs. Do not publish source-alias-only results.

## Compatibility policy

Breaking changes include:

- export removal or rename;
- required prop additions;
- public presentation-model field removal;
- token removal or semantic redefinition;
- changed controlled-state semantics;
- changed accessibility behavior requiring consumer changes;
- changed required CSS import order;
- stable knowledge ID changes;
- CLI or MCP schema incompatibility;
- Registry template variable removal or destination changes;
- Skill procedure changes that invalidate existing automation;
- Figma mapping changes to a semantically different component.

Internal file moves are not breaking when public exports, metadata IDs, behavior, and generated contracts remain stable.
