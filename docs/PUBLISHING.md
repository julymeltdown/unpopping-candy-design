# Publishing

## Current status

Public publication has not been executed. Repository-level prerequisites are configured, while npm organization and release-environment approval remain external steps.

```text
repository license  MIT
package licenses    MIT
pnpm-lock.yaml      committed
npm release         not executed
```

The manual release workflow calls `npm run release:check` before any publish action.

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
14. `NPM_TOKEN` or trusted publishing is configured appropriately.

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

AI packages are versioned independently from visual packages unless a change crosses their public contracts.

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

## Manual release workflow

The GitHub release workflow is manual and protected by the `npm-release` environment.

It executes:

```text
frozen dependency installation
release readiness
all tests and architecture gates
typecheck
all builds
optional publication
```

The publish input must be selected explicitly.

## Publish

Once packages are versioned and every precondition passes:

```bash
pnpm release
```

The command repeats release readiness, builds packages, and invokes Changesets publication.

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

Recommended future channels:

```text
latest   stable releases
next     release candidates and next-major work
canary   commit-scoped integration testing
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
