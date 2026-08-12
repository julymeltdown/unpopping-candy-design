# Unpopping Candy Stage 0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a reviewable `0.3.0-alpha.0` foundation candidate with truthful installed-version discovery, runnable browser contracts, reproducible adoption evidence, and fail-closed release gates.

**Architecture:** Keep deterministic catalog, resolver, static-evaluation, package, and documentation checks on pull requests. Put networked model runs, external account use, publication, and deployment behind explicit owner-controlled workflows; their local plan and validation modes must work without credentials.

**Tech Stack:** TypeScript, Node.js 22.13+/24, pnpm 11.4.0 workspace bootstrap, Storybook 10.5, Vitest 4 browser mode, Playwright 1.62.1, Changesets, npm/pnpm/Yarn lockfiles, GitHub Actions, Chromatic, GitHub Pages.

## Global Constraints

- Public brand is `Unpopping Candy`; the public command is `popcandy`; do not add `commonspace` names.
- Public packages are `tokens`, `theme`, `icons`, `ui`, `social`, `knowledge`, `registry`, `cli`, and `mcp`; `evals` and `figma` are private repository tooling.
- React peer range is `>=18.3 <20`; supported Node release lines are 22.13+ and 24.x; published declarations must compile with TypeScript 5.7.3.
- Published packages are ESM with explicit `exports`; CommonJS and private `src` or `dist` imports are unsupported.
- Supported clean-consumer managers are npm 10.9.9, npm 11.19.0, pnpm 10.34.5, pnpm 11.21.0, and Yarn Berry via `@yarnpkg/cli-dist@4.18.0` with `nodeLinker: node-modules`; Yarn Plug'n'Play fails closed. The repository's root `packageManager` remains `pnpm@11.4.0`.
- Supported framework cells use React 18.3.1 or 19.2.8 with Vite 8.1.0, Next.js 15.5.23, Next.js 16.3.0, or React Router 7.18.2 exactly as listed in Task 7.
- Real-model evidence uses five repetitions per task and model, records cost and usage, reports confidence intervals, and expires after 30 days.
- Generated catalog, agent, Registry, evaluation, story, and Figma files are changed through their source and `pnpm agent:generate`, never by hand.
- No package publication, model call, Chromatic upload, Pages deployment, repository-setting change, or public promotion occurs without the matching owner authorization named in Task 10.

---

## File map

| Responsibility               | Files                                                                                                                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Storybook/browser gates      | `vitest.config.ts`, `playwright.config.ts`, `tests/browser/smoke.spec.ts`, `apps/docs/package.json`, `package.json`, `pnpm-lock.yaml`, `.github/workflows/ci.yml`                                                                               |
| Public package policy        | `scripts/lib/public-packages.mjs`, `scripts/verify-package-contracts.mjs`, `scripts/verify-release-readiness.mjs`, `.changeset/config.json`, `.changeset/ai-native-system.md`, `packages/evals/package.json`, `packages/figma/package.json`     |
| Compatibility source         | `packages/knowledge/src/compatibility.ts`, `packages/knowledge/src/types.ts`, `packages/knowledge/src/index.ts`, `packages/knowledge/src/generated/compatibility.ts`, `scripts/generate-knowledge.mjs`, `agent/manifests/compatibility.json`    |
| Installed versions           | `packages/cli/src/project-errors.ts`, `packages/cli/src/version-resolution.ts`, `packages/cli/src/project-info.ts`, `packages/cli/src/types.ts`, `packages/cli/src/index.ts`, `packages/cli/package.json`                                       |
| Compatible discovery         | `packages/knowledge/src/search.ts`, `packages/cli/src/catalog-context.ts`, `packages/cli/src/commands.ts`, `packages/cli/src/bin.ts`, `packages/mcp/src/types.ts`, `packages/mcp/src/domain.ts`, `packages/mcp/src/stdio.ts`                    |
| Real-model evidence          | `packages/evals/src/model-captures.ts`, `packages/evals/src/providers.ts`, `packages/evals/src/statistics.ts`, `packages/evals/src/types.ts`, `packages/evals/src/index.ts`, `scripts/run-model-evals.mjs`, `.github/workflows/model-evals.yml` |
| Clean consumers              | `fixtures/compatibility/matrix.json`, `fixtures/compatibility/types.ts`, `fixtures/compatibility/scenarios/*.tsx`, `fixtures/compatibility/index.html`, `scripts/run-compatibility-matrix.mjs`                                                  |
| Trust documentation          | `README.md`, `docs/AI_ASSISTED_POST_CASE_STUDY.md`, `docs/COMPATIBILITY.md`, `docs/ACCESSIBILITY.md`, `docs/SUPPORT.md`, `docs/SECURITY.md`, `docs/VERSIONING.md`                                                                               |
| Bundle and publication gates | `config/bundle-budgets.json`, `scripts/verify-bundle-budgets.mjs`, `scripts/verify-release-authorizations.mjs`, `tests/architecture/bundle-budget.test.mjs`, `tests/architecture/release-authorization.test.mjs`, `.gitignore`                  |
| Delivery templates           | `scripts/prepare-release-candidate.mjs`, `tests/architecture/release-candidate.test.mjs`, `.github/workflows/storybook.yml`, `.github/workflows/release.yml`, `docs/PUBLISHING.md`, `.changeset/stage-zero-foundation.md`                       |

### Task 1: Make Storybook and cross-browser contracts executable

**Files:**

- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `tests/browser/smoke.spec.ts`
- Modify: `apps/docs/package.json`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `.github/workflows/ci.yml`
- Modify: `packages/ui/src/feedback/toast.tsx`
- Modify: `packages/ui/src/styles.css`
- Test: `tests/architecture/build-config.test.mjs`

**Interfaces:**

- Produces: root command `pnpm test:storybook` and Vitest project name `storybook`.
- Produces: root command `pnpm test:browser` over Chromium, Firefox, and WebKit with Storybook as its managed web server.
- Storybook interaction tests retain the existing `a11y.test = 'error'` policy.

- [ ] **Step 1: Capture the known failing browser command**

Run:

```bash
pnpm --filter @unpopping-candy/docs test -- --run
```

Expected: exit 1 with `No projects matched the filter "storybook"`.

- [ ] **Step 2: Add the browser project and its regression assertion**

Create `vitest.config.ts` with this complete configuration:

```ts
import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(import.meta.dirname, "apps/docs/.storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
```

Add root development dependencies `@storybook/addon-vitest@10.5.0`, `@vitest/browser-playwright@4.1.10`, `@playwright/test@1.62.1`, and `vitest@4.1.10`. Change the docs test script to `vitest --config ../../vitest.config.ts --project=storybook`; add root script `test:storybook` with value `pnpm --filter @unpopping-candy/docs test -- --run` and root script `test:browser` with value `playwright test`.

- [ ] **Step 3: Write the failing real-browser smoke test**

Create `tests/browser/smoke.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("serves a keyboard-focusable Button contract story", async ({ page }) => {
  await page.goto("/iframe.html?id=catalog-ui-button--contract&viewMode=story");
  const button = page.getByRole("button", { name: "Continue" });
  await expect(button).toBeVisible();
  await button.focus();
  await expect(button).toBeFocused();
});
```

Run: `pnpm test:browser`

Expected: FAIL because `playwright.config.ts` and installed browser binaries do not exist.

- [ ] **Step 4: Add one owned Playwright configuration**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  use: { baseURL: "http://127.0.0.1:6006", trace: "retain-on-failure" },
  webServer: {
    command: "pnpm --filter @unpopping-candy/docs dev",
    url: "http://127.0.0.1:6006",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: devices["Desktop Chrome"] },
    { name: "firefox", use: devices["Desktop Firefox"] },
    { name: "webkit", use: devices["Desktop Safari"] },
  ],
});
```

- [ ] **Step 5: Install exact dependencies and run both browser gates**

Run:

```bash
pnpm install
pnpm exec playwright install chromium firefox webkit
pnpm test:storybook
pnpm test:browser
```

Expected: the Storybook project and axe assertions pass in headless Chromium; the smoke story passes in Chromium, Firefox, and WebKit.

- [ ] **Step 6: Put both browser gates before package build in CI**

Change CI installation to `pnpm install --frozen-lockfile`, remove `--no-frozen-lockfile`, and add these steps after `pnpm verify`:

```yaml
- name: Install Playwright browsers
  run: pnpm exec playwright install --with-deps chromium firefox webkit
- name: Run Storybook interactions and accessibility checks
  run: pnpm test:storybook
- name: Run cross-browser Storybook smoke tests
  run: pnpm test:browser
```

Extend `tests/architecture/build-config.test.mjs` to assert the root stays `pnpm@11.4.0`, CI contains `pnpm install --frozen-lockfile`, and CI contains no `--no-frozen-lockfile`.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts playwright.config.ts tests/browser/smoke.spec.ts apps/docs/package.json package.json pnpm-lock.yaml .github/workflows/ci.yml tests/architecture/build-config.test.mjs
git commit -m "test: run Storybook cross-browser contracts"
```

### Task 2: Enforce the nine-public-package release unit

**Files:**

- Create: `scripts/lib/public-packages.mjs`
- Create: `scripts/lib/changeset-frontmatter.mjs`
- Modify: `scripts/verify-package-contracts.mjs`
- Modify: `scripts/verify-release-readiness.mjs`
- Modify: `.changeset/config.json`
- Modify: `.changeset/ai-native-system.md`
- Modify: `packages/evals/package.json`
- Modify: `packages/figma/package.json`
- Test: `tests/architecture/build-config.test.mjs`

**Interfaces:**

- Produces: `PUBLIC_PACKAGE_NAMES`, `PRIVATE_TOOL_PACKAGE_NAMES`, and `classifyPackageManifest(manifest)`.
- Produces: one Changesets fixed group containing exactly nine public package names.

- [ ] **Step 1: Write the failing policy test**

Add assertions that the public list has nine entries, `evals` and `figma` classify as private tooling, the Changesets fixed group equals the public list, and no Changeset frontmatter names a private tool:

```js
assert.equal(PUBLIC_PACKAGE_NAMES.length, 9);
assert.deepEqual(PRIVATE_TOOL_PACKAGE_NAMES, [
  "@unpopping-candy/evals",
  "@unpopping-candy/figma",
]);
assert.deepEqual(changesets.fixed, [PUBLIC_PACKAGE_NAMES]);
assert.deepEqual(
  changesetPackageNames.filter((name) =>
    PRIVATE_TOOL_PACKAGE_NAMES.includes(name),
  ),
  [],
);
```

Run: `node --test tests/architecture/build-config.test.mjs`

Expected: FAIL because no shared package policy exists and `fixed` is empty.

- [ ] **Step 2: Add the single package-policy source**

Create `scripts/lib/public-packages.mjs`:

```js
export const PUBLIC_PACKAGE_NAMES = Object.freeze([
  "@unpopping-candy/tokens",
  "@unpopping-candy/theme",
  "@unpopping-candy/icons",
  "@unpopping-candy/ui",
  "@unpopping-candy/social",
  "@unpopping-candy/knowledge",
  "@unpopping-candy/registry",
  "@unpopping-candy/cli",
  "@unpopping-candy/mcp",
]);

export const PRIVATE_TOOL_PACKAGE_NAMES = Object.freeze([
  "@unpopping-candy/evals",
  "@unpopping-candy/figma",
]);

export function classifyPackageManifest(manifest) {
  if (PUBLIC_PACKAGE_NAMES.includes(manifest.name)) return "public";
  if (PRIVATE_TOOL_PACKAGE_NAMES.includes(manifest.name)) return "private-tool";
  return "unknown";
}
```

- [ ] **Step 3: Apply the policy to manifests and release checks**

Mark the two tool packages `private: true`, remove their `publishConfig`, set `.changeset/config.json` to one `fixed` group with all nine public names, clear `linked`, and add the two private tools to `ignore`. Remove only the `@unpopping-candy/evals` and `@unpopping-candy/figma` entries from `.changeset/ai-native-system.md`; retain its four public-package entries and release copy. Update both verification scripts so public rules run only for `public`, private tools must be private and unpublishable, an unknown package directory is an error, and every Changeset naming private tooling fails.

Run:

```bash
node --test tests/architecture/build-config.test.mjs
node scripts/verify-package-contracts.mjs
node scripts/verify-release-readiness.mjs
```

Expected: all three commands exit 0 and report nine publishable packages plus two private tools.

- [ ] **Step 4: Commit**

```bash
git add scripts/lib/public-packages.mjs scripts/lib/changeset-frontmatter.mjs scripts/verify-package-contracts.mjs scripts/verify-release-readiness.mjs .changeset/config.json .changeset/ai-native-system.md packages/evals/package.json packages/figma/package.json tests/architecture/build-config.test.mjs
git commit -m "build: define the coordinated public package set"
```

### Task 3: Generate an exact package-set compatibility manifest

**Files:**

- Create: `packages/knowledge/src/compatibility.ts`
- Create: `packages/knowledge/src/generated/compatibility.ts`
- Modify: `packages/knowledge/src/types.ts`
- Modify: `packages/knowledge/src/index.ts`
- Modify: `scripts/generate-knowledge.mjs`
- Generate: `agent/manifests/compatibility.json`
- Test: `packages/knowledge/test/compatibility.test.ts`

**Interfaces:**

- Produces: `CompatibilityManifest`, `CompatibilityRelease`, `CatalogCompatibilityError`.
- Produces: `dependencyClosedPackageSets(manifests)` as sorted, non-empty public package-name sets.
- Produces: `selectCatalogVersion(manifest, installedVersions): string`.
- A release record contains `catalogVersion`, `catalogDigest`, `publicPackageVersions`, and `allowedPackageSets`; selection returns a version only when the matching catalog payload is actually available to Task 5.

- [ ] **Step 1: Write failing exact-set tests**

Import directly from `../src/compatibility.ts`, not the package index, and use a two-release fixture to assert exact selection, explicit prerelease mapping, mixed-version rejection, unknown-set rejection, and ambiguity rejection:

```ts
assert.equal(
  selectCatalogVersion(manifest, {
    "@unpopping-candy/ui": "0.3.0-alpha.0",
    "@unpopping-candy/tokens": "0.3.0-alpha.0",
  }),
  "0.3.0-alpha.0",
);
assert.throws(
  () =>
    selectCatalogVersion(manifest, {
      "@unpopping-candy/ui": "0.3.0-alpha.0",
      "@unpopping-candy/tokens": "0.2.0",
    }),
  (error) => error.code === "POPCANDY_VERSION_SET_MIXED",
);
```

Run: `node --experimental-strip-types --test packages/knowledge/test/compatibility.test.ts`

Expected: FAIL because the compatibility types and selector do not exist.

- [ ] **Step 2: Implement source types, dependency closure, and fail-closed selection**

Implement `dependencyClosedPackageSets` by enumerating every non-empty subset of the nine public packages and retaining it only when every selected package's internal public dependencies are also selected. Implement `selectCatalogVersion` by sorting installed names, finding records whose `allowedPackageSets` contains that exact name list and whose per-package versions all equal installed values, then requiring exactly one catalog. Emit `POPCANDY_VERSION_SET_MIXED` when known release versions are combined and `POPCANDY_CATALOG_INCOMPATIBLE` for unknown, ambiguous, or unavailable catalog matches.

Add explicit assertions for these supported sets:

```ts
const serializedSets = new Set(sets.map((set) => JSON.stringify(set)));
assert.ok(
  serializedSets.has(
    JSON.stringify([
      "@unpopping-candy/icons",
      "@unpopping-candy/theme",
      "@unpopping-candy/tokens",
      "@unpopping-candy/ui",
    ]),
  ),
);
assert.ok(
  serializedSets.has(
    JSON.stringify([
      "@unpopping-candy/cli",
      "@unpopping-candy/icons",
      "@unpopping-candy/knowledge",
      "@unpopping-candy/mcp",
      "@unpopping-candy/registry",
      "@unpopping-candy/tokens",
      "@unpopping-candy/ui",
    ]),
  ),
);
```

- [ ] **Step 3: Generate the initial artifacts without an index bootstrap cycle**

Change `scripts/generate-knowledge.mjs` to import source helpers directly from `catalog.ts`, `compatibility.ts`, `define.ts`, `source-api.ts`, and `stable-json.ts` while bootstrapping; do not import a generated compatibility symbol through `index.ts`. Read the nine public manifests, record their exact current versions including the explicitly compatible pre-Stage-0 `0.1.0` visual plus `0.2.0` tooling set, generate every dependency-closed set, and emit both generated files. The manifest contains only records with an available catalog payload; Stage 0 source has one current payload and does not claim an unbundled historical catalog.

Run:

```bash
pnpm knowledge:generate
node --experimental-strip-types --test packages/knowledge/test/compatibility.test.ts
pnpm knowledge:check
```

Expected: the tests pass and a second generation reports no drift.

- [ ] **Step 4: Add package-index exports only after generation succeeds**

Export the source types and functions plus `bundledCompatibilityManifest` from `packages/knowledge/src/index.ts`, then add a public-export assertion:

```ts
assert.equal(
  selectCatalogVersion(bundledCompatibilityManifest, {
    "@unpopping-candy/knowledge": "0.2.0",
  }),
  bundledCatalog.packageVersion,
);
```

Run:

```bash
pnpm knowledge:generate
pnpm --filter @unpopping-candy/knowledge test
pnpm knowledge:check
```

Expected: first-generation bootstrap, public re-export, and check mode all pass.

- [ ] **Step 5: Commit**

```bash
git add packages/knowledge/src/compatibility.ts packages/knowledge/src/generated/compatibility.ts packages/knowledge/src/types.ts packages/knowledge/src/index.ts packages/knowledge/test/compatibility.test.ts scripts/generate-knowledge.mjs agent/manifests/compatibility.json
git commit -m "feat: generate exact catalog compatibility"
```

### Task 4: Resolve installed versions from manifests and supported lockfiles

**Files:**

- Create: `packages/cli/src/project-errors.ts`
- Create: `packages/cli/src/version-resolution.ts`
- Modify: `packages/cli/src/project-info.ts`
- Modify: `packages/cli/src/types.ts`
- Modify: `packages/cli/src/index.ts`
- Modify: `packages/cli/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `scripts/verify-boundaries.mjs`
- Test: `packages/cli/test/version-resolution.test.ts`, `packages/cli/test/version-snapshot.test.ts`
- Test: `packages/cli/test/cli.test.ts`
- Test: `packages/mcp/test/domain.test.ts`

**Interfaces:**

- Produces: `PopcandyErrorCode` with exactly `POPCANDY_PROJECT_NOT_FOUND`, `POPCANDY_DEPENDENCIES_NOT_INSTALLED`, `POPCANDY_LOCKFILE_UNSUPPORTED`, `POPCANDY_PNP_UNSUPPORTED`, `POPCANDY_VERSION_SET_MIXED`, and `POPCANDY_CATALOG_INCOMPATIBLE`.
- Produces: `resolveInstalledPopcandyVersions(root, declaredNames): Promise` returning `versions`, `source` (`manifest`, `npm-lock-v3`, `pnpm-lock-v9`, or `none`), and `evidencePaths`.
- `PopcandyProjectInfo.installed` contains exact versions, never dependency ranges; it also exposes `versionResolutionSource`.

- [ ] **Step 1: Write failing resolver fixtures**

Create temporary projects covering a symlinked package manifest, npm lockfile v3, pnpm lockfile v9, Yarn Berry `node_modules`, unsupported npm lockfile v2, `.pnp.cjs`, declared-but-missing installation, no declared Unpopping Candy packages, and mixed versions. An empty declaration set returns `{ versions: {}, source: "none", evidencePaths: [] }`; it is Task 5's responsibility to decide whether a command needs catalog context. Assert exact error codes, including:

```ts
await assert.rejects(
  resolveInstalledPopcandyVersions(pnpRoot, ["@unpopping-candy/ui"]),
  (error) => error.code === "POPCANDY_PNP_UNSUPPORTED",
);
await assert.rejects(
  resolveInstalledPopcandyVersions(lockV2Root, ["@unpopping-candy/ui"]),
  (error) => error.code === "POPCANDY_LOCKFILE_UNSUPPORTED",
);
```

Run: `node --experimental-strip-types --test packages/cli/test/version-resolution.test.ts`

Expected: FAIL because the resolver module does not exist.

- [ ] **Step 2: Implement manifest-first resolution**

Use `createRequire(join(root, 'package.json')).resolve(packageName)` to locate an installed entry, walk parent directories until a package manifest with the requested `name` is found, and read its exact `version`. Resolve every declared Unpopping Candy dependency before considering a lockfile; workspace symlinks remain valid because the resolved file path is authoritative.

- [ ] **Step 3: Add only the two lockfile fallbacks**

Add `yaml@2.9.0` to CLI dependencies and run `pnpm install` so the root lockfile and installation agree. Parse npm lockfile version 3 from `packages[node_modules/package-name].version`; parse pnpm lockfile version 9 by resolving the root importer dependency to its snapshot. Yarn Berry `node_modules` succeeds through manifest-first resolution; reject Yarn lockfile-only, Bun, Yarn PnP, unsupported schema versions, unresolved aliases, and partial results with the stable codes and actionable guidance.

- [ ] **Step 4: Replace dependency ranges in project info**

Keep declared dependencies for framework detection, but call the resolver for `installed`. Convert missing start paths and missing package roots to `POPCANDY_PROJECT_NOT_FOUND` instead of an untyped error.

Run:

```bash
pnpm --filter @unpopping-candy/cli test
pnpm --filter @unpopping-candy/cli typecheck
```

Expected: exact manifest and supported lockfile versions pass; every unsupported state fails closed.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/project-errors.ts packages/cli/src/version-resolution.ts packages/cli/src/project-info.ts packages/cli/src/types.ts packages/cli/src/index.ts packages/cli/package.json packages/cli/test/version-resolution.test.ts packages/cli/test/version-snapshot.test.ts packages/cli/test/cli.test.ts packages/mcp/test/domain.test.ts pnpm-lock.yaml scripts/verify-boundaries.mjs docs/superpowers/plans/2026-08-11-unpopping-candy-stage-0-foundation.md
git commit -m "feat: resolve installed package versions"
```

### Task 5: Bind CLI and MCP discovery to the compatible catalog

**Files:**

- Create: `packages/knowledge/src/search.ts`
- Modify: `packages/knowledge/src/catalog.ts`
- Create: `packages/cli/src/catalog-context.ts`
- Create: `packages/cli/src/catalog-schema.ts`
- Modify: `packages/knowledge/src/index.ts`
- Modify: `packages/cli/src/types.ts`
- Modify: `packages/cli/src/commands.ts`
- Modify: `packages/cli/src/bin.ts`
- Modify: `packages/mcp/src/types.ts`
- Modify: `packages/mcp/src/domain.ts`
- Modify: `packages/mcp/src/stdio.ts`
- Modify: `packages/mcp/src/server.ts`
- Test: `packages/knowledge/test/search-diagnostics.test.ts`
- Test: `packages/cli/test/cli.test.ts`
- Test: `packages/cli/test/catalog-context.test.ts`
- Test: `packages/mcp/test/domain.test.ts`
- Test: `packages/mcp/test/server.test.ts`

**Interfaces:**

- Produces: `resolveCatalogContext(path)` returning exact project info, selected catalog payload, catalog version, and source (`installed-set` or `repository-config`).
- Produces: `catalogsByVersion`, initially containing only `bundledCatalog.packageVersion`; a selected version absent from this map fails `POPCANDY_CATALOG_INCOMPATIBLE` instead of falling back.
- Produces: `searchCatalogDetailed(catalog, query, options)` returning `results`, deterministic `benchmark` counts, and diagnostics for beta, experimental, deprecated, unsupported, truncated, and incompatible outcomes.
- Every `info`, `search`, `get`, `compose`, and `validate` call resolves one context before reading catalog data.

- [ ] **Step 1: Write failing command and diagnostic tests**

Assert that a mixed package fixture makes all five commands return `POPCANDY_VERSION_SET_MIXED`, `info --json` reports `versionResolutionSource`, a deprecated result remains visible with guidance, and a zero-result search reports scanned/eligible/returned counts plus `POPCANDY_SEARCH_UNSUPPORTED`. Also assert an empty project without a configured catalog gets a successful `info` response with `installed: {}`, `catalogVersion: null`, and `POPCANDY_DEPENDENCIES_NOT_INSTALLED`, while `search`, `get`, `compose`, and `validate` fail with that code.

Run:

```bash
node --experimental-strip-types --test packages/knowledge/test/search-diagnostics.test.ts packages/cli/test/cli.test.ts packages/mcp/test/domain.test.ts
```

Expected: FAIL because commands still use `bundledCatalog` without project compatibility.

- [ ] **Step 2: Add deterministic detailed search**

Keep `searchCatalog` as a compatibility wrapper over `searchCatalogDetailed(...).results`. Define the benchmark as integer counts only:

```ts
{
  scanned: catalog.entries.length,
  eligible: ranked.length,
  returned: results.length,
  omittedDeprecated,
  omittedIncompatible,
}
```

Do not include elapsed time. Attach a diagnostic to every non-stable result and every omitted/truncated class instead of silently discarding it.

- [ ] **Step 3: Resolve context once per CLI command**

Change `CliServices` to expose `projectContext(path)` for `info` and `catalogContext(path)` for catalog-requiring behavior. `catalogContext` first honors the target root's explicit `popcandy.config.json.catalog` path, validates that catalog, and labels it `repository-config`; otherwise it selects a version from installed packages and looks it up in `catalogsByVersion`. Add `--path` to the value-flag parser and use it for `info`, `search`, `get`, `compose`, and `validate`; remove it from positional query text. Preserve Registry dry-run behavior; `scaffold` must reject a template whose catalog is incompatible with the resolved project.

This explicit repository-config branch makes the repository's own `--path .` smoke commands valid despite the root manifest having no `@unpopping-candy/*` dependencies. It is not a fallback: an ordinary empty consumer without that config cannot search, get, compose, or validate.

- [ ] **Step 4: Reuse the same context in MCP**

Change MCP project, search, get, compose, and validate methods to accept an optional project path and call the same CLI context service. Remove copy that claims the catalog is merely bundled. Resource URIs remain stable but their returned content includes the selected catalog version.

Run:

```bash
pnpm --filter @unpopping-candy/knowledge test
pnpm --filter @unpopping-candy/cli test
pnpm --filter @unpopping-candy/mcp test
npm run popcandy -- info --path . --json
npm run popcandy -- search "profile settings" --path . --json
npm run popcandy -- get ui.button --path . --json
npm run popcandy -- compose "profile settings with loading, empty, error, and pending states" --path . --json
npm run popcandy -- validate --path . --json
```

Expected: tests pass; all five commands load the exact catalog declared by the root config, and search includes deterministic diagnostics. No command silently uses a newest or unmatched catalog.

- [ ] **Step 5: Commit**

```bash
git add packages/knowledge/src/search.ts packages/knowledge/src/catalog.ts packages/knowledge/src/index.ts packages/knowledge/test/search-diagnostics.test.ts packages/cli/src/catalog-context.ts packages/cli/src/catalog-schema.ts packages/cli/src/types.ts packages/cli/src/commands.ts packages/cli/src/bin.ts packages/cli/test/cli.test.ts packages/cli/test/catalog-context.test.ts packages/mcp/src/types.ts packages/mcp/src/domain.ts packages/mcp/src/stdio.ts packages/mcp/src/server.ts packages/mcp/test/domain.test.ts packages/mcp/test/server.test.ts
git commit -m "feat: bind discovery to installed compatibility"
```

### Task 6: Separate real-model captures from deterministic fixtures

**Files:**

- Create: `packages/evals/src/model-captures.ts`
- Create: `packages/evals/src/providers.ts`
- Create: `packages/evals/src/statistics.ts`
- Modify: `packages/evals/src/types.ts`
- Modify: `packages/evals/src/index.ts`
- Create: `scripts/run-model-evals.mjs`
- Create: `scripts/lib/model-eval-contract.mjs`
- Create: `scripts/lib/model-eval-execution.mjs`
- Create: `scripts/lib/model-eval-reporting.mjs`
- Create: `.github/workflows/model-evals.yml`
- Modify: `package.json`
- Modify: `.gitignore`
- Test: `packages/evals/test/model-captures.test.ts`
- Test: `packages/evals/test/model-eval-boundaries.test.ts`

**Interfaces:**

- Produces: schema-versioned `ModelEvaluationCapture` with prompt, bounded context digest, raw output, provider, model, timestamp, evaluator version, repetition, result, reason, input/output tokens, and estimated USD cost.
- Produces: `redactCapture`, `wilsonInterval`, `summarizeCaptures`, and provider adapters `codex` and `claude`.
- Produces: root aliases `pnpm evals:plan`, `pnpm evals:run`, and `pnpm evals:report` over `scripts/run-model-evals.mjs`.
- Raw captures live under `.artifacts/model-evals/raw`; sanitized summaries live under `.artifacts/model-evals/public`.

- [ ] **Step 1: Write failing capture, redaction, and statistics tests**

Assert required fields, explicit full model IDs, provider CLI name/version, five unique repetitions, rejection of captures older than 30 days, redaction of API-like secrets and absolute user paths, Wilson interval bounds, and separate no-context/context summaries. Add provider fixtures proving Codex JSONL extraction uses the final agent message and usage event while Claude extraction uses the JSON envelope's `structured_output` and `usage`.

Run: `node --experimental-strip-types --test packages/evals/test/model-captures.test.ts`

Expected: FAIL because capture validation and statistics do not exist.

- [ ] **Step 2: Implement the pure capture layer**

Implement validation without provider calls. `summarizeCaptures` must report compliance rate, 95% Wilson interval, absolute percentage-point improvement over no-context, total tokens, estimated cost, capture age, and whether the five-run requirement is met.

- [ ] **Step 3: Add pinned, hermetic provider commands and exact parsers**

Pin `@openai/codex@0.147.0` and `@anthropic-ai/claude-code@2.1.114` in the nightly workflow and reject any different `codex --version` or `claude --version` in provider preflight. Run each process from a fresh evaluation directory containing only approved public fixture files, the bounded public catalog excerpt, prompt, and schema. Mount or copy that directory into the hermetic runner read-only, allow provider API egress only, pass a credential-only environment allowlist, and record relative evidence paths; do not run either CLI from the repository or a user directory.

The Codex adapter keeps these verified flags and adds an explicit full model ID:

```text
codex exec --ignore-user-config --ephemeral --sandbox read-only --model "$POPCANDY_CODEX_MODEL" --json --output-schema capture-schema.json -
```

Treat Codex stdout as JSONL events: retain the raw stream, extract the final completed agent-message item as model output, and extract the terminal usage event. Codex CLI has no enforceable per-run USD flag, so `--max-estimated-usd` is explicitly an estimate. Real runs also require a positive `--codex-worst-case-usd`; before each repetition, refuse to start when accumulated usage-priced actual cost plus that independent configured worst-case exceeds the total. Use only versioned, explicitly priced full Codex model IDs and fail closed for unknown pricing before provider preflight. The Stage 0 pricing snapshot supports `gpt-5.3-codex` at $1.75 per million input tokens and $14.00 per million output tokens, conservatively treating every input token as non-cached, verified 2026-08-12 from https://developers.openai.com/api/docs/models/gpt-5.3-codex.

The Claude adapter keeps these verified flags, adds the exact model and budget, reads `capture-schema.json`, passes `JSON.stringify(schema)` as the literal `--json-schema` argument, and requires `ANTHROPIC_API_KEY` because `--bare` ignores OAuth/keychain state:

```text
claude --bare --print --tools "" --model "$POPCANDY_CLAUDE_MODEL" --output-format json --json-schema "$POPCANDY_SCHEMA_JSON" --max-budget-usd "$POPCANDY_CLAUDE_MAX_BUDGET_USD" --no-session-persistence --permission-mode plan
```

Parse Claude stdout as one result envelope and read only `structured_output` as generated content plus the envelope `usage`. Do not add the unsupported `--safe-mode` flag.

`pnpm evals:plan` requires `--codex-model`, `--claude-model`, `--max-estimated-usd`, and `--claude-max-budget-usd`, then prints every task/model/context/repetition without invoking either executable. `pnpm evals:run` requires the same values, `POPCANDY_MODEL_EVAL_APPROVED=true`, and provider credentials. `pnpm evals:report` performs no provider call; it validates, redacts, summarizes, and writes public evidence.

- [ ] **Step 4: Add disabled-by-default nightly automation**

Create a nightly and manual workflow whose run job is conditional on repository variable `POPCANDY_MODEL_EVAL_ENABLED == 'true'`, uses environment `model-evaluations`, installs the two pinned CLI versions, verifies them, supplies required full model IDs and both budget values from approved environment configuration, sets five repetitions, runs `pnpm evals:run` then `pnpm evals:report`, and uploads sanitized evidence separately from encrypted-retention raw artifacts. The pull-request workflow continues to run only deterministic `evals:check` and `pnpm evals:plan` with fixture-only model IDs.

Run:

```bash
pnpm evals:plan -- --codex-model codex-fixture-model --claude-model claude-fixture-model --max-estimated-usd 0 --claude-max-budget-usd 0
pnpm --filter @unpopping-candy/evals test
```

Expected: plan lists twenty runs per task for two models and two context modes at five repetitions; no process calls a model.

- [ ] **Step 5: Commit**

```bash
git add packages/evals/src/model-captures.ts packages/evals/src/providers.ts packages/evals/src/statistics.ts packages/evals/src/types.ts packages/evals/src/index.ts packages/evals/test/model-captures.test.ts packages/evals/test/model-eval-boundaries.test.ts scripts/run-model-evals.mjs scripts/lib/model-eval-contract.mjs scripts/lib/model-eval-execution.mjs scripts/lib/model-eval-reporting.mjs .github/workflows/model-evals.yml package.json .gitignore docs/superpowers/plans/2026-08-11-unpopping-candy-stage-0-foundation.md
git commit -m "feat: add reproducible model evaluation captures"
```

### Task 7: Verify packed artifacts in exact clean consumer cells

**Files:**

- Create: `fixtures/compatibility/matrix.json`
- Create: `fixtures/compatibility/types.ts`
- Create: `fixtures/compatibility/scenarios/base.tsx`
- Create: `fixtures/compatibility/scenarios/publish-post.tsx`
- Create: `fixtures/compatibility/scenarios/member-moderation.tsx`
- Create: `fixtures/compatibility/scenarios/activity-review.tsx`
- Create: `fixtures/compatibility/index.html`
- Create: `scripts/run-compatibility-matrix.mjs`
- Create: `scripts/lib/compatibility-contract.mjs`
- Create: `scripts/lib/compatibility-process.mjs`
- Create: `scripts/lib/compatibility-consumer.mjs`
- Create: `scripts/lib/compatibility-execution.mjs`
- Create: `scripts/lib/compatibility-termination.mjs`
- Modify: `package.json`
- Test: `tests/architecture/inspection.test.mjs`
- Test: `tests/architecture/compatibility-boundaries.test.mjs`

**Interfaces:**

- Produces the only packed-consumer engine: root script `fixtures:compat` delegates to `scripts/run-compatibility-matrix.mjs`; later stage plans modify their owned scenario and must not create another scenario, pack, or install runner.
- Supports `--fixture base|publish-post|member-moderation|activity-review`, `--cell` plus `--manager`, and `--all`. A focused run requires fixture, cell, and manager; `--fixture publish-post --all` runs that fixture across seven cells and five managers (35 runs); bare `--all` runs all four fixtures across all cells and managers (140 runs).
- Exports `packPublicWorkspace(options)` and `runCompatibilityMatrix(options)` so Task 10 reuses this implementation inside its staging workspace.
- Produces `.artifacts/compatibility/fixture-id/cell-id/manager-id.json` with exact Node, package-manager, framework, React, browser, tarball digest, install, typecheck, build, and smoke-test results.

- [ ] **Step 1: Write the failing matrix-contract test**

Assert these cell IDs exist exactly: `vite-react-18`, `vite-react-19`, `next-15-react-18`, `next-15-react-19`, `next-16-react-19`, `react-router-7-react-18`, and `react-router-7-react-19`. Their versions are Vite 8.1.0, React 18.3.1/19.2.8, Next 15.5.23/16.3.0, and React Router 7.18.2. Assert manager IDs map to npm 10.9.9/11.19.0, pnpm 10.34.5/11.21.0, and `@yarnpkg/cli-dist@4.18.0` with generated `.yarnrc.yml` containing `nodeLinker: node-modules`. Assert `--fixture publish-post --all --plan` enumerates 35 unique runs, bare `--all --plan` enumerates 140, and both plan modes perform no install.

Run: `node --test tests/architecture/inspection.test.mjs`

Expected: FAIL because the matrix manifest does not exist.

- [ ] **Step 2: Add the four canonical scenario modules**

Define the scenario contract in `fixtures/compatibility/types.ts`:

```ts
export type CompatibilityFixtureId =
  | "base"
  | "publish-post"
  | "member-moderation"
  | "activity-review";

export interface CompatibilityScenario {
  fixtureId: CompatibilityFixtureId;
  expectedAccessibleName: string;
}
```

Each scenario exports its exact `fixtureId`, `expectedAccessibleName`, and default React component. `base` proves theme/styles/Button; `publish-post` renders the existing `PostComposerView` with consumer-owned draft/submission state; `member-moderation` renders existing profile plus Dialog/Button surfaces with consumer-owned permission/action state; `activity-review` renders existing `NotificationItem` surfaces with consumer-owned loading/error/list state. Stage 1, 2, and 3 modify only their corresponding scenario to adopt new public components.

- [ ] **Step 3: Implement clean pack, install, type, build, and smoke orchestration**

Add root script `fixtures:compat` with value `node scripts/run-compatibility-matrix.mjs`. The runner builds exactly the nine public packages, packs each with `pnpm pack`, computes SHA-256 digests, copies the chosen scenario into a new temporary directory, generates the selected framework entry and package manifest, installs only tarball paths and exact external versions, runs TypeScript 5.7.3, builds, then opens the result with Playwright. Reject a generated manifest containing a workspace alias or an import containing `/src` or `/dist`.

Use manager-specific executables at the exact pinned version, record `--version` before install, and keep the source repository on `pnpm@11.4.0`. Yarn runs the `@yarnpkg/cli-dist@4.18.0` binary with `nodeLinker: node-modules`; no lane enables Plug'n'Play.

- [ ] **Step 4: Run one focused cell and the package-manager lanes**

```bash
pnpm fixtures:compat -- --fixture base --cell vite-react-19 --manager pnpm-11
pnpm fixtures:compat -- --fixture publish-post --cell vite-react-19 --manager npm-10
pnpm fixtures:compat -- --fixture activity-review --cell vite-react-19 --manager yarn-4
```

Expected: all installs occur outside the workspace and all three results record exact versions and tarball digests.

- [ ] **Step 5: Commit**

```bash
git add fixtures/compatibility/matrix.json fixtures/compatibility/types.ts fixtures/compatibility/scenarios/base.tsx fixtures/compatibility/scenarios/publish-post.tsx fixtures/compatibility/scenarios/member-moderation.tsx fixtures/compatibility/scenarios/activity-review.tsx fixtures/compatibility/index.html scripts/run-compatibility-matrix.mjs scripts/lib/compatibility-contract.mjs scripts/lib/compatibility-process.mjs scripts/lib/compatibility-consumer.mjs scripts/lib/compatibility-execution.mjs scripts/lib/compatibility-termination.mjs package.json tests/architecture/inspection.test.mjs tests/architecture/compatibility-boundaries.test.mjs docs/superpowers/plans/2026-08-11-unpopping-candy-stage-0-foundation.md
git commit -m "test: add packed consumer compatibility matrix"
```

### Task 8: Replace the landing README and publish trust policies

**Files:**

- Modify: `README.md`
- Create: `docs/AI_ASSISTED_POST_CASE_STUDY.md`
- Create: `docs/COMPATIBILITY.md`
- Create: `docs/ACCESSIBILITY.md`
- Create: `docs/SUPPORT.md`
- Create: `docs/SECURITY.md`
- Create: `docs/VERSIONING.md`
- Modify: `docs/STORYBOOK_AI.md`
- Modify: `docs/PUBLISHING.md`
- Modify: `docs/CLI.md`
- Create: `docs/evidence/stage-0-compatibility-summary.json`
- Modify: `scripts/verify-docs.mjs`
- Create: `scripts/lib/documentation-trust.mjs`
- Create: `scripts/lib/documentation-claims.mjs`
- Create: `scripts/lib/documentation-policy.mjs`
- Create: `scripts/lib/historical-evidence.mjs`
- Create: `scripts/verify-registry-templates.mjs`
- Test: `tests/architecture/markdown-contract.test.mjs`
- Test: `tests/architecture/documentation-trust.test.mjs`
- Test: `tests/architecture/documentation-policy.test.mjs`
- Test: `tests/architecture/registry-template-typecheck.test.mjs`
- Modify: `packages/social/src/post-composer/post-composer-view.docs.ts`
- Modify: `packages/social/src/post-card/post-actions.docs.ts`
- Modify: `packages/ui/src/inline/inline.docs.ts`
- Modify: `packages/ui/src/tabs/tabs.docs.ts`
- Modify: `packages/social/src/post-card/post-header.docs.ts`
- Modify: `packages/social/src/profile/profile-header.docs.ts`
- Modify: `packages/social/src/user-cell/user-cell.docs.ts`
- Modify: `packages/ui/src/avatar/avatar.docs.ts`
- Modify: `packages/ui/src/icon-button/icon-button.docs.ts`
- Modify: `packages/ui/src/stack/stack.docs.ts`
- Modify: `packages/ui/src/surface/surface.docs.ts`
- Modify: `packages/registry/templates/social-feed-page/src/social-feed-page.tsx`
- Modify: `packages/registry/templates/moderation-workspace/src/moderation-workspace.tsx`
- Modify: `packages/registry/templates/fsd-social-shell/src/pages/home/ui/home-page.tsx`
- Modify: `packages/registry/templates/fsd-social-shell/src/widgets/post-feed/ui/post-feed.tsx`
- Modify: `packages/knowledge/test/generated-catalog.test.ts`
- Create: `packages/knowledge/test/public-examples.test.ts`
- Create: `packages/knowledge/test/public-example-contract.ts`
- Create: `packages/knowledge/test/public-example-parser.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify (generator-owned output only): `agent/components/*.md`, `agent/llms-full.txt`, `agent/manifests/{build,catalog,compatibility,components,registry}.json`, `figma/code-connect/*.figma.ts`, `packages/knowledge/src/generated/{catalog,compatibility}.ts`, `packages/registry/src/registry.json`

**Interfaces:**

- Produces: a 200–300 line README landing page and stable policy links.
- Produces: a local publish-a-post evidence record that Stage 1 extends without changing its evidence schema.

- [ ] **Step 1: Add failing documentation contracts**

Assert README line count is within 200–300 and includes product definition, social/collaboration differentiator, honest scope, runnable install, one local agent workflow using `info/search/get/compose/validate`, proof links, nine-package map, limitations, and contribution route. Assert each policy file exists and names its exact support window or reporting path.

Run: `node --test tests/architecture/markdown-contract.test.mjs`

Expected: FAIL because README is 1,363 lines and policy files are absent.

- [ ] **Step 2: Write the concise landing page**

Keep the overview image, use one copy-paste Vite quickstart, explain what application code still owns, link Storybook/catalog/case-study evidence, distinguish repository-implemented components from Stages 1–3, and list all nine public packages plus two private tools. Do not claim npm availability, public Figma mappings, remote Registry, hosted MCP, or real-model results until corresponding evidence exists.

- [ ] **Step 3: Record the local AI-assisted publish-a-post slice**

Use this fixed section order in `docs/AI_ASSISTED_POST_CASE_STUDY.md`: task and acceptance criteria; fixture and exact installed versions; prompt; bounded inputs; `popcandy` transcript; output diff; Storybook/axe/visual commands; model/provider/timestamp; failures and corrections; no-context comparison; reproducibility and redaction. If model authorization is absent, the document states `Real-model comparison: not executed` and Stage 0 remains ineligible for a public model claim.

- [ ] **Step 4: Write exact policy documents**

Document the compatibility cells and package-manager limits from Task 7; WCAG 2.2 AA and rolling latest-two browser window; VoiceOver/Safari, NVDA/Chrome, and real iOS evidence schema; pre-1.0 current-minor support; security contact through GitHub private vulnerability reporting; ESM/deprecation/withdrawal/prerelease rules; and external authorization boundaries.

Run:

```bash
node scripts/verify-docs.mjs
node --test tests/architecture/markdown-contract.test.mjs
```

Expected: both commands pass and README stays inside 200–300 lines.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/AI_ASSISTED_POST_CASE_STUDY.md docs/COMPATIBILITY.md docs/ACCESSIBILITY.md docs/SUPPORT.md docs/SECURITY.md docs/VERSIONING.md docs/STORYBOOK_AI.md docs/PUBLISHING.md docs/CLI.md docs/evidence/stage-0-compatibility-summary.json scripts/verify-docs.mjs scripts/verify-registry-templates.mjs scripts/lib/documentation-trust.mjs scripts/lib/documentation-claims.mjs scripts/lib/documentation-policy.mjs scripts/lib/historical-evidence.mjs tests/architecture/markdown-contract.test.mjs tests/architecture/documentation-trust.test.mjs tests/architecture/documentation-policy.test.mjs tests/architecture/registry-template-typecheck.test.mjs packages/social/src/post-composer/post-composer-view.docs.ts packages/social/src/post-card/post-actions.docs.ts packages/social/src/post-card/post-header.docs.ts packages/social/src/profile/profile-header.docs.ts packages/social/src/user-cell/user-cell.docs.ts packages/ui/src/avatar/avatar.docs.ts packages/ui/src/icon-button/icon-button.docs.ts packages/ui/src/inline/inline.docs.ts packages/ui/src/stack/stack.docs.ts packages/ui/src/surface/surface.docs.ts packages/ui/src/tabs/tabs.docs.ts packages/registry/templates/social-feed-page/src/social-feed-page.tsx packages/registry/templates/moderation-workspace/src/moderation-workspace.tsx packages/registry/templates/fsd-social-shell/src/pages/home/ui/home-page.tsx packages/registry/templates/fsd-social-shell/src/widgets/post-feed/ui/post-feed.tsx packages/knowledge/test/generated-catalog.test.ts packages/knowledge/test/public-examples.test.ts packages/knowledge/test/public-example-contract.ts packages/knowledge/test/public-example-parser.ts package.json pnpm-lock.yaml agent/components/*.md agent/llms-full.txt agent/manifests/{build,catalog,compatibility,components,registry}.json figma/code-connect/*.figma.ts packages/knowledge/src/generated/{catalog,compatibility}.ts packages/registry/src/registry.json docs/superpowers/plans/2026-08-11-unpopping-candy-stage-0-foundation.md
git commit -m "fix: verify published contracts"
```

### Task 9: Enforce MIT, bundle, namespace, and brand gates

**Files:**

- Create: `config/bundle-budgets.json`
- Create: `scripts/verify-bundle-budgets.mjs`
- Create: `scripts/lib/bundle-policy.mjs`
- Create: `scripts/verify-release-authorizations.mjs`
- Modify: `scripts/verify-release-readiness.mjs`
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `packages/theme/vite.config.ts`
- Modify: `packages/icons/vite.config.ts`
- Modify: `packages/ui/vite.config.ts`
- Modify: `packages/social/vite.config.ts`
- Test: `tests/architecture/build-config.test.mjs`
- Test: `tests/architecture/bundle-budget.test.mjs`
- Test: `tests/architecture/release-authorization.test.mjs`

**Interfaces:**

- Produces: root `bundle:check`; Stage 0 invokes `--stage stage-0 --json .artifacts/bundles/stage-0.json`, later stages pass their own stage and report path, and optional `--changed-from` classifies newly added catalog IDs.
- Produces only the requested ephemeral report; Stage 0 uses `.artifacts/bundles/stage-0.json`. Reports and measurements never modify the budget source.
- Produces: `node scripts/verify-release-authorizations.mjs --scope npm,brand` reading `.artifacts/authorizations/release.json`.
- `config/bundle-budgets.json` contains immutable cumulative allocations for all four approved stages plus separate 10% unplanned-growth ceilings.

- [ ] **Step 1: Write failing budget and authorization tests**

Assert every public package has a baseline, an unplanned-growth ceiling, and all four cumulative stage ceilings; the numeric allocation table equals the literal table in Step 2; stage values never decrease; a synthetic oversized artifact fails without rewriting config; `--json .artifacts/bundles/stage-0.json` writes only that path; a newly added reserved ID uses its stage ceiling, a newly added unreserved ID fails closed, and an edit to an existing ID in Stage 1 uses the Stage 1 cumulative ceiling rather than the Stage 0 unplanned ceiling. Also assert the root license contains the MIT grant, every public manifest says MIT, and release mode fails when namespace or brand approval evidence is absent or expired.

Run:

```bash
node --test tests/architecture/bundle-budget.test.mjs tests/architecture/release-authorization.test.mjs
```

Expected: FAIL because neither gate exists.

- [ ] **Step 2: Implement deterministic gzip measurement**

Measure built `.js`, `.css`, and `.json` files with Node `gzipSync` at level 9; exclude declarations, maps, and tests. Store this exact byte table in `config/bundle-budgets.json`:

| Package   | Baseline | Unplanned | Stage 0 | Stage 1 | Stage 2 | Stage 3 |
| --------- | -------: | --------: | ------: | ------: | ------: | ------: |
| tokens    |     2597 |      2900 |    2900 |    5000 |    6500 |    8000 |
| theme     |     1826 |      2050 |    2050 |    2300 |    2500 |    2800 |
| icons     |     2005 |      2250 |    2250 |    3500 |    4500 |    5500 |
| ui        |    15220 |     16750 |   16750 |   45000 |   75000 |  110000 |
| social    |    10336 |     11400 |   11400 |   14000 |   20000 |   30000 |
| knowledge |    26161 |     28800 |   30000 |   52000 |   76000 |  105000 |
| registry  |     4556 |      5100 |    5100 |    6500 |    7500 |    9000 |
| cli       |     8330 |      9200 |   15000 |   15000 |   15000 |   16000 |
| mcp       |     4808 |      5300 |    5300 |    7000 |    8500 |   10000 |

The four stage columns are cumulative roadmap allocations, not automatically learned baselines. Store these immutable planned catalog-ID lists beside them:

- `stage-0`: no new public component IDs.
- `stage-1`: `ui.checkbox`, `ui.checkbox-group`, `ui.radio`, `ui.radio-group`, `ui.switch`, `ui.select`, `ui.select-item`, `ui.select-section`, `ui.combo-box`, `ui.list-box`, `ui.list-box-item`, `ui.list-box-section`.
- `stage-2`: `ui.menu`, `ui.menu-trigger`, `ui.menu-item`, `ui.menu-section`, `ui.menu-separator`, `ui.menu-checkbox-item`, `ui.menu-radio-item`, `ui.popover`, `ui.tooltip`, `ui.disclosure`, `ui.accordion`.
- `stage-3`: `ui.breadcrumbs`, `ui.breadcrumb-item`, `ui.pagination`, `ui.table`, `ui.data-grid`, `ui.progress`.

When `--changed-from` finds a newly added catalog ID, require it to appear in the selected stage's reserved list; an unreserved addition fails closed. Stage 1–3 edits to existing IDs use the selected cumulative stage ceiling, so ordinary fixes remain possible. Stage 0 has explicit foundation allocations for the knowledge and CLI work already implemented; the unplanned column governs later non-expansion package growth where no public catalog ID changed. Tests hard-code this table and the approved ID lists, so later stages may consume the allocations but cannot raise them by editing JSON alone.

- [ ] **Step 3: Implement publication authorization evidence**

Require a schema-versioned local JSON record with npm organization, approving owner, approval date, brand confirmation, and expiry. Validate exact organization `@unpopping-candy`, reject records older than 90 days, redact the approver identifier in logs, and keep `.artifacts/authorizations` ignored. `--plan` reports missing evidence without failing; `--scope npm,brand` fails closed.

- [ ] **Step 4: Wire package, license, and budget gates**

Add `bundle:check` with value `node scripts/verify-bundle-budgets.mjs` to root scripts and call `bundle:check -- --stage stage-0 --json .artifacts/bundles/stage-0.json` from `verify-release-readiness.mjs`; compare every public manifest license with root `LICENSE.md`, require two private tools to remain private, and expose no command that writes or raises a baseline. Make every Vite library build empty its own `dist` before emitting so hashed chunks from an earlier build cannot enter measurements or published tarballs; cover that invariant in `build-config.test.mjs`.

Run:

```bash
pnpm build:packages
pnpm bundle:check -- --stage stage-0 --json .artifacts/bundles/stage-0.json
node scripts/verify-release-authorizations.mjs --plan
node --test tests/architecture/bundle-budget.test.mjs tests/architecture/release-authorization.test.mjs
```

Expected: bundle and unit gates pass, `.artifacts/bundles/stage-0.json` records all nine measurements, source config remains byte-identical, and authorization plan truthfully reports external npm/brand evidence as present or missing without changing files.

- [ ] **Step 5: Commit**

```bash
git add config/bundle-budgets.json scripts/lib/bundle-policy.mjs scripts/verify-bundle-budgets.mjs scripts/verify-release-authorizations.mjs scripts/verify-release-readiness.mjs package.json .gitignore packages/theme/vite.config.ts packages/icons/vite.config.ts packages/ui/vite.config.ts packages/social/vite.config.ts tests/architecture/build-config.test.mjs tests/architecture/bundle-budget.test.mjs tests/architecture/release-authorization.test.mjs docs/superpowers/plans/2026-08-11-unpopping-candy-stage-0-foundation.md
git commit -m "build: enforce release trust budgets"
```

### Task 10: Prepare authorized delivery and an ephemeral `alpha.0` candidate

**Files:**

- Create: `scripts/prepare-release-candidate.mjs`
- Create: `tests/architecture/release-candidate.test.mjs`
- Create: `.github/workflows/storybook.yml`
- Modify: `.github/workflows/release.yml`
- Modify: `docs/PUBLISHING.md`
- Create: `.changeset/stage-zero-foundation.md`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**

- Produces the Stage 0 command `pnpm release:candidate -- --version 0.3.0-alpha.0 --channel next --out .artifacts/releases/stage-0-alpha.0`; Stages 1–3 use the same required `--version`, `--channel`, and `--out` interface with their plan's exact values.
- Produces: `validateCandidateRequest`, `sourceHashes`, and `prepareReleaseCandidate` for pure contract tests and the CLI adapter.
- Produces `.artifacts/releases/stage-0-alpha.0/candidate.json`, `.artifacts/releases/stage-0-alpha.0/packages` with exactly nine tarballs, and `.artifacts/releases/stage-0-alpha.0/workspace` as an ephemeral staging copy.
- `requestedVersion` is the single version input used for staging public manifest versions, exact workspace selectors, packed dependency ranges, compatibility generation, tarball names, and `candidate.json`; the implementation contains no stage-specific prerelease literal.
- Source package manifests, source lockfile, source generated compatibility, and normal Changesets remain byte-identical after candidate preparation.
- Produces dry-run-capable Pages, Chromatic, and npm trusted-publishing workflows; publication remains a separate owner action and prereleases use npm tag `next`.

- [ ] **Step 1: Write the failing non-mutating candidate tests**

Create a temporary repository fixture with the nine public manifests, two private tools, internal workspace ranges, a lockfile, and normal Changesets. Hash its source files, request `0.3.0-alpha.0`, and assert:

```js
assert.equal(result.requestedVersion, "0.3.0-alpha.0");
assert.equal(result.channel, "next");
assert.equal(result.packages.length, 9);
assert.ok(result.packages.every((item) => item.sha256.length === 64));
assert.deepEqual(await sourceHashes(fixtureRoot), hashesBefore);
assert.throws(
  () =>
    validateCandidateRequest({ version: "0.3.0-alpha.0", channel: "latest" }),
  /prerelease candidates require channel next/,
);
```

For the Stage 0 case, assert every staging public manifest version is `0.3.0-alpha.0`; every staging dependency on a public workspace package is exactly `workspace:0.3.0-alpha.0`, including dependencies declared by private tools; every packed public manifest contains bare exact `0.3.0-alpha.0` internal ranges; `candidate.json.requestedVersion` is `0.3.0-alpha.0`; private tools are absent; staging compatibility selects that exact version; and invoking the pack phase calls the exported Task 7 engine rather than a second pack implementation.

Run the pure manifest-rewrite and packed-manifest assertions again with `requestedVersion = "0.3.0-beta.0"` and require `workspace:0.3.0-beta.0` in staging plus bare `0.3.0-beta.0` after packing. This second case must use the same functions and contain no Stage 2 branch.

Run: `node --test tests/architecture/release-candidate.test.mjs`

Expected: FAIL because the candidate module and root alias do not exist.

- [ ] **Step 2: Implement candidate preparation in an isolated staging copy**

Add root script `release:candidate` with value `node scripts/prepare-release-candidate.mjs`, and ignore `.artifacts/releases/`. Require `--version`, `--channel`, and `--out`; reject a source-tree output, an existing non-empty output, a non-prerelease version on `next`, or a prerelease on any other channel. For Stage 0, the exact invocation is:

```bash
pnpm release:candidate -- --version 0.3.0-alpha.0 --channel next --out .artifacts/releases/stage-0-alpha.0
```

The implementation performs this order:

1. Hash source public/private manifests, `pnpm-lock.yaml`, generated compatibility files, and `.changeset`.
2. Copy the repository without `.git`, `node_modules`, `dist`, `storybook-static`, or `.artifacts` into the output workspace.
3. Run `pnpm install --frozen-lockfile` and normal `pnpm version-packages` only inside staging; require Changesets to calculate exactly `0.3.0` for all nine public packages before candidate rewriting.
4. Rewrite all nine staging public versions to `requestedVersion`. Rewrite every staging dependency on a public workspace package to exact `workspace:${requestedVersion}`, including selectors in private-tool manifests; leave private-tool manifest versions unchanged.
5. Run `pnpm install` inside staging to refresh its lockfile, then run `pnpm install --frozen-lockfile`, `pnpm agent:generate`, `pnpm agent:check`, `pnpm test:pure`, `pnpm typecheck`, and `pnpm build:packages` there. The second install proves the refreshed staging lock is reproducible.
6. Replace the staging compatibility output with the generated candidate record for its available candidate catalog; do not append or overwrite the source tree's pre-Stage-0 record.
7. Call Task 7's exported `packPublicWorkspace` for exactly nine tarballs, verify every packed internal public dependency is bare exact `requestedVersion`, then call `runCompatibilityMatrix` for fixture `base`, cell `vite-react-19`, and manager `pnpm-11` against those tarballs.
8. Write `requestedVersion`, relative tarball paths, names, versions, SHA-256 digests, catalog digest, source commit, channel, and verification results to `candidate.json`.
9. Re-hash the source paths and fail if any source byte changed.

- [ ] **Step 3: Add a normal source Changeset without entering prerelease mode**

Create `.changeset/stage-zero-foundation.md` with a `minor` entry for each of the nine public package names and release copy naming installed-version resolution, compatibility selection, Storybook/browser checks, and trust policies. Do not create Changesets prerelease state or run `version-packages` in the source checkout. The source branch accumulates normal Changesets until Stage 3 alone performs the stable source `version-packages` operation.

- [ ] **Step 4: Add delivery workflows with explicit external gates**

The Storybook workflow installs with `pnpm install --frozen-lockfile`, installs Playwright 1.62.1 Chromium/Firefox/WebKit, runs `pnpm test:storybook`, `pnpm test:browser`, and the Storybook build on pull requests, then uploads `apps/docs/storybook-static`. It runs Chromatic only when repository variable `POPCANDY_CHROMATIC_ENABLED` is `true`, and deploys Pages only when `POPCANDY_PAGES_ENABLED` is `true` on `master`. Use `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`, and `chromaui/action@v13`.

Keep release permission `id-token: write`, remove `NODE_AUTH_TOKEN`, require environment `npm-release`, run the authorization verifier, and build with `pnpm release:candidate -- --version 0.3.0-alpha.0 --channel next --out .artifacts/releases/stage-0-alpha.0`. When manual input `publish` is true, read the nine digests back, then publish each verified tarball with `npm publish --provenance --access public --tag next`. Document that npm trusted-publisher configuration and GitHub environment approval must already name this repository and workflow. Stable `latest` publication is owned by Stage 3 and is not added here.

- [ ] **Step 5: Run the candidate and prove the source stayed untouched**

Run:

```bash
mkdir -p .artifacts/releases
git status --porcelain=v1 > .artifacts/releases/status-before.txt
pnpm release:candidate -- --version 0.3.0-alpha.0 --channel next --out .artifacts/releases/stage-0-alpha.0
git status --porcelain=v1 > .artifacts/releases/status-after.txt
diff .artifacts/releases/status-before.txt .artifacts/releases/status-after.txt
```

Expected: candidate manifest lists exactly nine `0.3.0-alpha.0` tarballs and their digests, the focused packed-consumer result passes, and the status files are identical.

- [ ] **Step 6: Run the complete Stage 0 exit gate**

```bash
pnpm agent:check
pnpm test:pure
pnpm verify
pnpm typecheck
pnpm build
pnpm test:storybook
pnpm test:browser
pnpm bundle:check -- --stage stage-0 --json .artifacts/bundles/stage-0.json
pnpm fixtures:compat -- --all
pnpm evals:plan -- --codex-model codex-fixture-model --claude-model claude-fixture-model --max-estimated-usd 0 --claude-max-budget-usd 0
node scripts/verify-release-authorizations.mjs --plan
node --test tests/architecture/release-candidate.test.mjs
git diff --check
```

Expected: deterministic, Storybook/axe, three-browser, package, bundle, candidate, and all packed-consumer gates pass. Evaluation and authorization plans report exact enabled or missing external inputs without invoking providers or publishing anything.

- [ ] **Step 7: Record manual trust evidence**

Before public promotion, attach a Chromatic review, Pages URL, actual Node/browser versions, Safari/VoiceOver, Chrome/NVDA, real iOS Safari, fresh model captures, npm namespace/brand confirmation, and five-evaluator onboarding results to the release evidence. Missing evidence blocks the corresponding public claim or publication; it does not get replaced by an automated result.

- [ ] **Step 8: Commit source preparation without candidate artifacts**

```bash
git add scripts/prepare-release-candidate.mjs tests/architecture/release-candidate.test.mjs .github/workflows/storybook.yml .github/workflows/release.yml docs/PUBLISHING.md .changeset/stage-zero-foundation.md package.json .gitignore
git commit -m "release: prepare ephemeral alpha candidates"
```

## Stage 0 exit decision

Stage 1 may begin when the complete Task 10 deterministic, browser, candidate, and clean-consumer commands pass; Storybook interaction/axe checks are observable in Chromium; cross-browser smoke passes in Chromium, Firefox, and WebKit; version resolution fails closed for unsupported states; all four immutable cumulative budget allocations are committed; and preparing `0.3.0-alpha.0` leaves source manifests, lockfile, generated knowledge, and Changesets untouched. A public `next` publication additionally requires owner-authorized npm namespace and branding evidence, trusted-publisher configuration, fresh real-model captures with an accepted budget, Chromatic/Pages credentials, and named browser/assistive-technology evidence. The implementation agent must stop at each missing external authorization and report it rather than infer success.
