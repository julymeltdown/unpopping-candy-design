# Unpopping Candy Stage 4A Figma Traceability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a code-first, fail-closed Figma library contract that projects stable Unpopping Candy tokens and components into real Figma variables or styles, published component nodes, and Code Connect mappings before the `1.0` Figma gate can pass.

**Architecture:** Keep `@unpopping-candy/figma` private repository tooling. A strict schema-v2 configuration records the published Figma file, generalized token bindings, component anatomy, properties, usage, and accessibility notes. Pure generators cross-validate `tokens.json`, `tokens.ts`, and `styles.css`, then project primitive values to Figma variables, composite typography to text styles, shadows to effect styles, and the stable knowledge catalog to `figma/library.json`, the Figma manifest, and parserless Code Connect templates. Local generation accepts an incomplete draft and reports readiness gaps; publication and `1.0` verification use distinct fail-closed commands that require every stable component and represented token to have real Figma evidence.

**Tech Stack:** TypeScript, Node.js 22.13+/24.x, Node test runner, `@figma/code-connect@1.5.0` template API, Unpopping Candy knowledge catalog, CSS custom properties, deterministic JSON generation.

## Global Constraints

- Stage 0 and stable `0.3.0` through Stage 3 must be complete before executing Stage 4A.
- Public packages remain `tokens`, `theme`, `icons`, `ui`, `social`, `knowledge`, `registry`, `cli`, and `mcp`; `figma` remains private repository tooling.
- The Figma library is code-first because no canonical Figma library exists yet.
- Stable code tokens, component metadata, public entrypoints, and Storybook contract stories are authoritative; generated Figma files are never hand-edited.
- Figma theme modes are `light`, `dark`, and `high-contrast`; runtime `system` resolves to light or dark and is not a Figma variable mode.
- Figma density modes are `comfortable` and `compact`; accent modes are `blue`, `violet`, and `neutral`.
- Code Connect imports must use the exact documented `@unpopping-candy/*` public entrypoint and must never contain `/src`, `/dist`, or repository-relative imports.
- Every stable component token that requires a Figma representation must resolve to a real variable, text style, or effect style; every stable component also needs anatomy, variants/properties, accessibility notes, usage guidance, a published component node, and a verified Code Connect mapping before the Figma `1.0` gate passes.
- Stage 4 does not block stable `0.3.0`; Figma traceability is required before `1.0`.
- Do not upload a Figma file, run authenticated Figma API operations, spend Figma/Dev Mode budget, or publish Code Connect mappings without explicit approval from the named Figma publishing owner.
- Do not store Figma access tokens in the repository, generated manifests, logs, or evidence files.
- Stage 4A does not change public runtime APIs, so it does not add a Changeset unless execution reveals and separately approves a required public-package change.

---

## Dependencies and file map

Execute after:

1. `docs/superpowers/plans/2026-08-11-unpopping-candy-stage-0-foundation.md`
2. `docs/superpowers/plans/2026-08-11-unpopping-candy-stage-1-forms.md`
3. `docs/superpowers/plans/2026-08-11-unpopping-candy-stage-2-interactions.md`
4. `docs/superpowers/plans/2026-08-11-unpopping-candy-stage-3-navigation-data.md`

Files with one responsibility each:

- `packages/figma/src/types.ts`: schema-v2 config, token projection, mapping, manifest, and validation issue types.
- `packages/figma/src/config.ts`: parse untrusted JSON and validate structural schema without declaring it publishable.
- `packages/figma/src/token-projection.ts`: cross-validate the three checked-in token representations and project variables, text styles, and effect styles.
- `packages/figma/src/figma.ts`: join stable catalog entries, projected token representations, and reviewed bindings into library/manifest/template output.
- `packages/figma/src/index.ts`: export private tooling functions and types used by scripts and tests.
- `packages/figma/test/config.test.ts`: schema parsing and fail-closed publication tests.
- `packages/figma/test/token-projection.test.ts`: token collection, alias, mode, and drift tests.
- `packages/figma/test/figma.test.ts`: stable-component coverage, public import, parserless property mapping, and duplicate-node tests.
- `packages/figma/package.json`: mark tooling private and remove public-package metadata.
- `figma/popcandy.figma.json`: reviewed, hand-authored schema-v2 Figma file and mapping evidence.
- `figma.config.json`: Code Connect discovery contract for generated parserless templates.
- `scripts/generate-figma.mjs`: generate/check draft artifacts and run strict publication readiness validation.
- `scripts/verify-figma-code-connect.mjs`: run parserless Code Connect into a bounded temporary output file and compare its deterministic result with the generated manifest.
- `tests/architecture/figma-code-connect.test.mjs`: verify CLI arguments, output-file boundaries, diagnostics limits, and cleanup on success and failure.
- `scripts/verify-figma-1-0-readiness.mjs`: enforce the Figma-specific `1.0` gate and write no files.
- `package.json`: expose deterministic check, local parse, authenticated dry-run, publication, and `1.0` gate commands.
- `packages/figma/README.md`: explain the private tool boundary and command sequence.
- `docs/FIGMA.md`: contributor-facing code-to-Figma mapping and owner approval runbook.
- `figma/library.json`: generated source provenance, variables, text/effect styles, modes, anatomy, variants, properties, and usage/a11y guidance.
- `figma/manifest.json`: generated token-binding, component-to-node, and publication evidence manifest.
- `agent/manifests/figma.json`: generated portable mapping manifest for repository agent checks.
- `figma/code-connect/*.figma.ts`: generated parserless Code Connect templates for ready mappings only.

### Task 1: Make Figma tooling private and define schema-v2 evidence

**Files:**

- Modify: `packages/figma/package.json`
- Modify: `packages/figma/src/types.ts`
- Create: `packages/figma/src/config.ts`
- Modify: `packages/figma/src/index.ts`
- Create: `packages/figma/test/config.test.ts`

**Interfaces:**

- Consumes: unknown JSON read from `figma/popcandy.figma.json`.
- Produces: `parseFigmaIntegrationConfig(value: unknown): FigmaIntegrationConfig`; structural parsing never implies publication readiness.
- Produces: `validateFigmaPublication(config: FigmaIntegrationConfig, stableComponents: readonly ComponentDoc[], tokenRequirements: readonly FigmaTokenRequirement[]): readonly FigmaValidationIssue[]`.

- [ ] **Step 1: Write failing config and privacy tests**

Add tests that assert `packages/figma/package.json` has `private: true`, has no `publishConfig`, and that schema-v2 parsing preserves the exact evidence contract:

```ts
const config = parseFigmaIntegrationConfig({
  schemaVersion: 2,
  libraryName: "Unpopping Candy",
  designFileUrl: "https://www.figma.com/design/abc123/Unpopping-Candy",
  modes: {
    theme: ["light", "dark", "high-contrast"],
    density: ["comfortable", "compact"],
    accent: ["blue", "violet", "neutral"],
  },
  publication: {
    owner: "Unpopping Candy Design Systems",
    fileVersion: "42",
    publishedAt: "2026-08-11T09:00:00.000Z",
    reviewedBy: "Unpopping Candy Maintainers",
    reviewedAt: "2026-08-11T09:30:00.000Z",
  },
  tokenBindings: {
    "--popcandy-surface": {
      kind: "variable",
      key: "VariableID:101:202",
    },
    "typography.body": {
      kind: "text-style",
      key: "S:101:303",
    },
    "--popcandy-shadow-raised": {
      kind: "effect-style",
      keysByMode: {
        light: "S:101:404",
        dark: "S:101:405",
        "high-contrast": "S:101:406",
      },
    },
  },
  mappings: {},
});

assert.equal(config.schemaVersion, 2);
assert.deepEqual(config.modes.theme, ["light", "dark", "high-contrast"]);
```

Also assert malformed URLs, unknown mode names, invalid ISO timestamps, empty owner/file-version/reviewer strings, empty Figma binding keys, an effect style missing any theme-mode key, unknown binding kinds, `system` as a Figma theme mode, and unknown object keys throw `FigmaConfigError` with stable codes.

- [ ] **Step 2: Run the focused tests and observe failure**

Run:

```bash
pnpm --filter @unpopping-candy/figma test
```

Expected: FAIL because `config.ts`, schema-v2 types, and the private-package contract do not exist.

- [ ] **Step 3: Implement the exact config types and parser**

Define these contracts in `types.ts` and implement strict key/type/URL/date checks in `config.ts`:

```ts
export interface FigmaPublicationEvidence {
  owner: string;
  fileVersion: string;
  publishedAt: string;
  reviewedBy: string;
  reviewedAt: string;
}

export type FigmaPropertyBinding =
  | { kind: "boolean"; figmaProperty: string }
  | { kind: "string"; figmaProperty: string }
  | {
      kind: "enum";
      figmaProperty: string;
      options: Readonly<Record<string, string>>;
    }
  | { kind: "slot"; figmaProperty: string };

export interface FigmaComponentConfig {
  componentKey: string;
  nodeUrl: string;
  mappedAt: string;
  anatomy: readonly {
    name: string;
    layerName: string;
    required: boolean;
    description: string;
  }[];
  properties: Readonly<Record<string, FigmaPropertyBinding>>;
  codeTemplate: {
    imports: readonly { name: string; from: string }[];
    code: string;
    bindings: Readonly<Record<string, FigmaPropertyBinding>>;
  };
  usageGuidance: readonly string[];
  accessibilityNotes: readonly string[];
}

export type FigmaTokenBinding =
  | { kind: "variable"; key: string }
  | { kind: "text-style"; key: string }
  | {
      kind: "effect-style";
      keysByMode: Readonly<Record<"light" | "dark" | "high-contrast", string>>;
    };

export interface FigmaTokenRequirement {
  token: string;
  bindingKind: FigmaTokenBinding["kind"];
}

export interface FigmaIntegrationConfig {
  schemaVersion: 2;
  libraryName: string;
  designFileUrl: string;
  modes: {
    theme: readonly ["light", "dark", "high-contrast"];
    density: readonly ["comfortable", "compact"];
    accent: readonly ["blue", "violet", "neutral"];
  };
  publication: FigmaPublicationEvidence | null;
  tokenBindings: Readonly<Record<string, FigmaTokenBinding>>;
  mappings: Readonly<Record<string, FigmaComponentConfig>>;
}
```

Use `https://www.figma.com/design/` as the only accepted production file URL prefix and require each component node URL to share the exact design-file key. Keep draft readiness separate by allowing `publication: null` and missing mapping entries in structural parsing.

- [ ] **Step 4: Make the package private**

Set `"private": true` and remove `"publishConfig"` from `packages/figma/package.json`. Keep its build/test/typecheck scripts because the repository still executes the tooling.

- [ ] **Step 5: Run focused tests and typecheck**

Run:

```bash
pnpm --filter @unpopping-candy/figma test
pnpm --filter @unpopping-candy/figma typecheck
```

Expected: both commands exit 0; the parser accepts only schema version 2 and package privacy is asserted.

- [ ] **Step 6: Commit the private schema boundary**

```bash
git add packages/figma/package.json packages/figma/src/types.ts packages/figma/src/config.ts packages/figma/src/index.ts packages/figma/test/config.test.ts
git commit -m "feat: define private Figma evidence contract"
```

### Task 2: Cross-validate code tokens and project Figma variables and styles

**Files:**

- Create: `packages/figma/src/token-projection.ts`
- Modify: `packages/figma/src/types.ts`
- Modify: `packages/figma/src/index.ts`
- Create: `packages/figma/test/token-projection.test.ts`
- Verify: `packages/tokens/src/tokens.json`
- Verify: `packages/tokens/src/tokens.ts`
- Verify: `packages/tokens/src/styles.css`

**Interfaces:**

- Consumes: the exact text of `packages/tokens/src/tokens.json`, the exact text plus evaluated exported token objects from `packages/tokens/src/tokens.ts`, and the exact text of `packages/tokens/src/styles.css`.
- Produces: `projectFigmaTokens(sources: TokenProjectionSources): FigmaTokenProjection`.
- Produces variable collections named `Foundation`, `Theme`, `Density`, and `Accent`, plus text-style and effect-style definitions; aliases retain their logical target rather than copying a resolved value.
- Produces: stable `FigmaTokenProjectionIssue` codes, including `token-source-missing`, `token-source-mismatch`, `token-alias-unresolved`, and `token-value-unsupported`.

- [ ] **Step 1: Write failing token projection tests**

Use all three real token sources and assert exact mode behavior and representation classification:

```ts
import {
  componentTokens,
  motion,
  radii,
  referenceColors,
  space,
  typography,
} from "../../tokens/src/tokens.ts";

const [tokenJsonText, tokenTypeScript, css] = await Promise.all([
  readFile(new URL("../../tokens/src/tokens.json", import.meta.url), "utf8"),
  readFile(new URL("../../tokens/src/tokens.ts", import.meta.url), "utf8"),
  readFile(new URL("../../tokens/src/styles.css", import.meta.url), "utf8"),
]);
const projection = projectFigmaTokens({
  tokenJson: tokenJsonText,
  tokenTypeScript,
  tokenExports: {
    componentTokens,
    motion,
    radii,
    referenceColors,
    space,
    typography,
  },
  css,
});
const theme = projection.variableCollections.find(
  (entry) => entry.name === "Theme",
);
const density = projection.variableCollections.find(
  (entry) => entry.name === "Density",
);
const accent = projection.variableCollections.find(
  (entry) => entry.name === "Accent",
);

assert.deepEqual(theme?.modes, ["light", "dark", "high-contrast"]);
assert.deepEqual(density?.modes, ["comfortable", "compact"]);
assert.deepEqual(accent?.modes, ["blue", "violet", "neutral"]);
assert.equal(
  theme?.variables["--popcandy-surface"]?.values.light?.kind,
  "alias",
);
assert.equal(
  theme?.variables["--popcandy-surface"]?.values.dark?.kind,
  "color",
);
assert.ok(!theme?.modes.includes("system"));
assert.equal(projection.tokens["space.4"]?.kind, "dimension");
assert.equal(projection.tokens["motion.duration.fast"]?.kind, "duration");
assert.equal(projection.tokens["motion.easing.standard"]?.kind, "easing");
assert.equal(projection.tokens["typography.family.sans"]?.kind, "font-family");
assert.equal(
  projection.textStyles.find((entry) => entry.token === "typography.body")
    ?.lineHeight,
  1.55,
);
assert.equal(
  projection.effectStyles.find(
    (entry) =>
      entry.token === "--popcandy-shadow-raised" && entry.mode === "light",
  )?.effects[0]?.kind,
  "drop-shadow",
);
```

Add assertions for `--popcandy-button-height-md` being `40px` in comfortable and `36px` in compact, `--popcandy-accent` having all three accent modes, a `rem` dimension normalizing against its CSS pixel equivalent at the contract root of 16px, a cubic-bezier easing retaining all four numbers, a font-family list retaining order and quoting, a composite typography record becoming a text style, a shadow becoming an effect style, and a CSS alias retaining its target token.

Clone each source independently and change one overlapping value. Assert a JSON/TypeScript mismatch and a TypeScript/CSS mismatch both return `token-source-mismatch`; removing a declared cross-source counterpart returns `token-source-missing`. Every stable `ComponentDoc.tokens` entry must resolve to exactly one projected representation requirement.

- [ ] **Step 2: Run the focused test and observe failure**

Run:

```bash
node --experimental-strip-types --test packages/figma/test/token-projection.test.ts
```

Expected: FAIL because `projectFigmaTokens` and the cross-source projection types are not exported.

- [ ] **Step 3: Implement the projection types and strict parser**

Add these types:

```ts
export type FigmaTokenKind =
  | "color"
  | "dimension"
  | "duration"
  | "easing"
  | "font-family"
  | "typography"
  | "shadow"
  | "alias";

export type FigmaPrimitiveValue =
  | { kind: "color"; value: string }
  | { kind: "dimension"; value: number; unit: "px" | "rem" }
  | { kind: "duration"; value: number; unit: "ms" }
  | { kind: "easing"; value: readonly [number, number, number, number] }
  | { kind: "font-family"; value: readonly string[] }
  | { kind: "alias"; variable: string };

export interface FigmaVariableCollection {
  name: "Foundation" | "Theme" | "Density" | "Accent";
  modes: readonly string[];
  variables: Readonly<
    Record<
      string,
      {
        type: "COLOR" | "FLOAT" | "STRING";
        values: Readonly<Record<string, FigmaPrimitiveValue>>;
      }
    >
  >;
}

export interface FigmaTextStyleDefinition {
  token: string;
  fontFamily: readonly string[];
  fontSize: { value: number; unit: "px" | "rem" };
  lineHeight: number;
  fontWeight: number;
}

export interface FigmaEffectStyleDefinition {
  token: string;
  mode: "light" | "dark" | "high-contrast";
  effects: readonly {
    kind: "drop-shadow" | "inner-shadow";
    color: string;
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
  }[];
}

export interface TokenProjectionSources {
  tokenJson: string;
  tokenTypeScript: string;
  tokenExports: {
    componentTokens: Readonly<Record<string, unknown>>;
    motion: Readonly<Record<string, unknown>>;
    radii: Readonly<Record<string, unknown>>;
    referenceColors: Readonly<Record<string, unknown>>;
    space: Readonly<Record<string, unknown>>;
    typography: Readonly<Record<string, unknown>>;
  };
  css: string;
}

export interface FigmaTokenProjectionIssue {
  code:
    | "token-source-missing"
    | "token-source-mismatch"
    | "token-alias-unresolved"
    | "token-value-unsupported";
  token: string;
  sources: readonly ("tokens.json" | "tokens.ts" | "styles.css")[];
  message: string;
}

export interface FigmaTokenProjection {
  sourceDigests: Readonly<
    Record<"tokens.json" | "tokens.ts" | "styles.css", string>
  >;
  tokens: Readonly<Record<string, { kind: FigmaTokenKind }>>;
  variableCollections: readonly FigmaVariableCollection[];
  textStyles: readonly FigmaTextStyleDefinition[];
  effectStyles: readonly FigmaEffectStyleDefinition[];
  bindingRequirements: readonly FigmaTokenRequirement[];
  issues: readonly FigmaTokenProjectionIssue[];
}
```

Derive `bindingRequirements` with one fixed rule: `color`, `dimension`, `duration`, `easing`, `font-family`, and `alias` require `variable`; `typography` requires `text-style`; `shadow` requires `effect-style`. Do not coerce composite typography or shadows into string variables.

Normalize DTCG values, TypeScript exports, and CSS declarations into one logical token graph. The parser must classify hex/rgb colors; `px` and `rem` dimensions; `ms` durations; cubic-bezier easing; ordered font-family lists and typography records; shadow/effect lists; and aliases. Build the `typography.body` text style from `typography.family.sans`, `typography.size.body`, `typography.lineHeight.body`, and a numeric weight of 400. Build one `--popcandy-shadow-raised` and one `--popcandy-shadow-dialog` effect style for each of `light`, `dark`, and `high-contrast` from the complete mode-specific CSS shadow value; an effect-style binding therefore requires all three real style keys. Cross-source equality compares normalized colors, converts `rem` to pixels only for equality using 16px as the contract root, preserves the original unit in output, and compares alias targets rather than resolved values. A token represented by multiple sources must agree in every source declared by the crosswalk; missing or unequal representations are blocking issues. Reject duplicate declarations, unresolved aliases, incomplete composite typography/shadow values, missing required mode values, and unclassified syntax. Treat the `prefers-color-scheme` copy of runtime `system` as runtime behavior, not a fourth design mode.

- [ ] **Step 4: Run token tests and package gates**

Run:

```bash
node --experimental-strip-types --test packages/figma/test/token-projection.test.ts
pnpm --filter @unpopping-candy/figma typecheck
```

Expected: both commands exit 0; all three token sources agree, every stable catalog token has one representation requirement, and variable collections plus text/effect styles are deterministic.

- [ ] **Step 5: Commit token projection**

```bash
git add packages/figma/src/types.ts packages/figma/src/token-projection.ts packages/figma/src/index.ts packages/figma/test/token-projection.test.ts
git commit -m "feat: project code tokens to Figma bindings"
```

### Task 3: Generate component anatomy, properties, and exact Code Connect templates

**Files:**

- Modify: `packages/figma/src/figma.ts`
- Modify: `packages/figma/src/types.ts`
- Modify: `packages/figma/src/index.ts`
- Modify: `packages/figma/test/figma.test.ts`

**Interfaces:**

- Consumes: stable `ComponentDoc` entries, `FigmaIntegrationConfig`, and `FigmaTokenProjection`.
- Produces: `createFigmaLibrary(catalog: KnowledgeCatalog, tokenProjection: FigmaTokenProjection, config: FigmaIntegrationConfig, generatedAt?: string): FigmaLibraryManifest`.
- Produces: `generateCodeConnectTemplates(catalog: KnowledgeCatalog, manifest: FigmaManifest): readonly GeneratedFigmaFile[]`; templates are emitted only for `ready` mappings.
- Produces: `validateFigmaPublication(...)`; results are sorted by `componentId` and stable issue code.

- [ ] **Step 1: Replace count-based tests with stable-catalog contract tests**

Derive the expected set instead of hardcoding the current component count:

```ts
const stableIds = bundledCatalog.entries
  .filter(
    (entry): entry is ComponentDoc =>
      entry.kind === "component" && entry.status === "stable",
  )
  .map((entry) => entry.id)
  .sort();

const manifest = createFigmaManifest(bundledCatalog, readyConfig);
assert.deepEqual(
  manifest.components.map((entry) => entry.componentId),
  stableIds,
);
```

Add failures for an absent stable mapping, a mapping for a beta component, a duplicate real node URL, missing anatomy, empty usage guidance, empty accessibility notes, a component token without the required `variable`, `text-style`, or `effect-style` binding, a binding whose kind disagrees with the projected token representation, a missing Storybook contract, and imports containing `/src`, `/dist`, or an entrypoint absent from the component metadata.

- [ ] **Step 2: Write the exact parserless Button template assertion**

The fixture maps `ui.button` with `Disabled` and `Label` properties. Assert the generated file contains this API shape:

```ts
import figma from "figma";

const disabled = figma.properties.boolean("Disabled");
const label = figma.properties.string("Label");

export default {
  example: figma.tsx`<Button disabled=${disabled}>${label}</Button>`,
  imports: ['import { Button } from "@unpopping-candy/ui/button"'],
  id: "ui-button",
  metadata: {
    nestable: true,
    props: {
      knowledgeId: "ui.button",
      storyId: "catalog-ui-button--contract",
    },
  },
};
```

Also assert the output does not contain raw React Aria imports and every configured binding identifier appears in the `codeTemplate.code` string.

- [ ] **Step 3: Run the focused test and observe failure**

Run:

```bash
node --experimental-strip-types --test packages/figma/test/figma.test.ts
```

Expected: FAIL because the current manifest includes non-stable entries, synthesizes fake nodes, and emits static `figma.code` examples without property bindings.

- [ ] **Step 4: Implement library and template generation**

Remove generated node URLs. A catalog component without a reviewed config entry becomes a manifest record with `status: 'draft'`, `nodeUrl: null`, and a sorted `readinessIssues` array; it does not produce a `.figma.ts` file. A fully evidenced mapping becomes `status: 'ready'` only when all publication checks pass.

Render binding declarations with the installed Code Connect 1.5.0 template API:

```ts
function renderBinding(name: string, binding: FigmaPropertyBinding): string {
  if (binding.kind === "boolean")
    return `const ${name} = figma.properties.boolean('${binding.figmaProperty}')`;
  if (binding.kind === "string")
    return `const ${name} = figma.properties.string('${binding.figmaProperty}')`;
  if (binding.kind === "slot")
    return `const ${name} = figma.properties.slot('${binding.figmaProperty}')`;
  return `const ${name} = figma.properties.enum('${binding.figmaProperty}', ${JSON.stringify(binding.options)})`;
}
```

Generate imports exclusively from `codeTemplate.imports` after proving each `from` value is one of the catalog entrypoints. Include anatomy, property definitions, variants, used token bindings with binding kind and all required real Figma keys, accessibility notes, usage guidance, Storybook ID, component key, node URL, mapping date, and file publication evidence in the deterministic manifest.

- [ ] **Step 5: Run focused tests and Code Connect parsing**

Run:

```bash
pnpm --filter @unpopping-candy/figma test
pnpm --filter @unpopping-candy/figma typecheck
npm run figma:generate
npm run figma:parse
```

Expected: package tests/typecheck and generation exit 0. `npm run figma:parse` invokes the local parserless Code Connect 1.5.0 parser with a bounded temporary `--outFile`, `--skip-update-check`, and `--exit-on-unreadable-files`, supplies no token, performs no publish request, parses only the output file, compares parsed IDs/imports/counts with the generated manifest, cleans the temporary directory, and exits 0. Draft components appear in manifests but have no template.

- [ ] **Step 6: Commit component and Code Connect generation**

```bash
git add packages/figma/src/types.ts packages/figma/src/figma.ts packages/figma/src/index.ts packages/figma/test/figma.test.ts figma/manifest.json agent/manifests/figma.json figma/code-connect
git commit -m "feat: generate traceable Figma component mappings"
```

### Task 4: Upgrade deterministic generation and publication checks

**Files:**

- Modify: `scripts/generate-figma.mjs`
- Create: `scripts/verify-figma-code-connect.mjs`
- Create: `tests/architecture/figma-code-connect.test.mjs`
- Modify: `figma/popcandy.figma.json`
- Modify: `figma.config.json`
- Modify: `package.json`
- Generate: `figma/library.json`
- Generate: `figma/manifest.json`
- Generate: `agent/manifests/figma.json`
- Generate: `figma/code-connect/*.figma.ts`

**Interfaces:**

- Consumes: schema-v2 config, `packages/tokens/src/tokens.json`, `packages/tokens/src/tokens.ts`, `packages/tokens/src/styles.css`, and `bundledCatalog`.
- Produces commands with separate intent: `figma:generate`, `figma:check`, `figma:publish-check`, `figma:parse`, and `figma:publish:dry-run`.
- Produces no network call from `figma:generate`, `figma:check`, `figma:publish-check`, or `figma:parse`; `figma:publish:dry-run` is an authenticated API validation and never publishes.
- Produces: `type CodeConnectRunner = (input: { executable: string; args: readonly string[]; cwd: string; maxOutputBytes: number }) => Promise<{ exitCode: number; stdout: string; stderr: string }>`.
- Produces: `verifyLocalCodeConnect(options: { repositoryRoot: string; temporaryRoot?: string; runCli?: CodeConnectRunner }): Promise<void>`, with a 5 MiB parsed-file ceiling and 64 KiB diagnostic ceiling per stdout/stderr stream. `temporaryRoot` exists only for isolated tests; production omits it and uses `os.tmpdir()`.

- [ ] **Step 1: Add failing generator-mode tests**

Extend `packages/figma/test/config.test.ts` so draft validation returns sorted issues but generation succeeds, while publication validation rejects the same config with `missing-publication-evidence`, `unmapped-stable-component`, and `unmapped-token-binding` codes. Add separate wrong-kind fixtures that require `variable`, `text-style`, and `effect-style` respectively and assert `token-binding-kind-mismatch`.

- [ ] **Step 2: Run the current publication check and capture the expected red gate**

Run:

```bash
npm run figma:publish-check
```

Expected before real Figma evidence exists: non-zero exit listing every stable component or token that is not ready. This is the required fail-closed baseline, not a defect to bypass.

- [ ] **Step 3: Implement three generator intents**

Make the script select exactly one intent:

```ts
const intent = process.argv.includes("--publish-check")
  ? "publish"
  : process.argv.includes("--check")
    ? "check"
    : "generate";
```

For all intents, parse config, cross-validate all three token sources, project variables and styles, create the library/manifest/templates, and reject token-source, schema, or catalog inconsistencies. `generate` writes deterministic files. `check` compares all generated files and removes nothing. `publish` first performs the same drift comparison, then exits non-zero for every readiness issue. Delete the old `allowPlaceholders` escape hatch.

- [ ] **Step 4: Write failing parser-wrapper boundary tests**

In `tests/architecture/figma-code-connect.test.mjs`, inject a fake `CodeConnectRunner` that receives the executable and arguments and writes to the path following `--outFile`. Cover these exact cases:

```js
test("reads the bounded outFile and ignores informational stdout", async () => {
  const seen = [];
  await verifyLocalCodeConnect({
    repositoryRoot: fixtureRoot,
    temporaryRoot: fixtureTemporaryRoot,
    runCli: async ({ args }) => {
      seen.push(...args);
      const outputPath = args[args.indexOf("--outFile") + 1];
      await writeFile(outputPath, JSON.stringify(validParsedDocuments));
      return {
        exitCode: 0,
        stdout: "Code Connect local parser informational preamble\n",
        stderr: "",
      };
    },
  });
  assert.deepEqual(
    seen.filter((arg) => arg.startsWith("--")),
    [
      "--config",
      "--outFile",
      "--skip-update-check",
      "--exit-on-unreadable-files",
    ],
  );
  assert.ok(!seen.includes("--token"));
  assert.ok(!seen.includes("--dry-run"));
  assert.ok(!seen.includes("--api-url"));
});
```

Also assert rejection for non-zero CLI exit, absent output, directory output, symlink output, empty output, output larger than `5 * 1024 * 1024` bytes, malformed file JSON, duplicate/unknown/missing Code Connect IDs, private imports, and stdout or stderr exceeding `64 * 1024` bytes. After every success and failure, assert no `popcandy-figma-` directory remains below the injected temporary root. Assert informational stdout/stderr is never treated as the JSON payload and failure diagnostics replace `Bearer owner-secret-value` and `figd_owner_secret_value` rather than retaining either token-shaped value.

- [ ] **Step 5: Run the parser-wrapper test and observe failure**

```bash
node --test tests/architecture/figma-code-connect.test.mjs
```

Expected: FAIL because `verifyLocalCodeConnect` and the bounded `--outFile` runner do not exist.

- [ ] **Step 6: Implement bounded temporary-file parser verification**

In `scripts/verify-figma-code-connect.mjs`, create a private temporary directory and pass an output file explicitly to installed Code Connect 1.5.0:

```js
const temporaryDirectory = await mkdtemp(
  join(options.temporaryRoot ?? tmpdir(), "popcandy-figma-"),
);
const outputPath = join(temporaryDirectory, "code-connect.json");
const args = [
  "connect",
  "parse",
  "--config",
  "figma.config.json",
  "--outFile",
  outputPath,
  "--skip-update-check",
  "--exit-on-unreadable-files",
];
```

Require CLI exit code 0. Use `lstat` to reject absent, symlink, directory, empty, or larger-than-5-MiB output before reading it. Parse only `code-connect.json`; normalize document order by Code Connect ID and compare IDs, node URLs, labels, and imports with ready entries in `figma/manifest.json`. The production runner terminates the child and rejects as soon as stdout or stderr exceeds 64 KiB, so it never accumulates an unbounded stream. Redact bearer tokens and Figma-token-shaped values and use the bounded streams only in failure diagnostics. Never parse either stream as JSON. Do not pass `--token`, `--dry-run`, or an API URL.

Wrap creation, CLI execution, validation, and comparison in `try`/`finally` and always run:

```js
await rm(temporaryDirectory, { recursive: true, force: true });
```

The deletion target is the exact path returned by `mkdtemp`, never a caller-supplied path, glob, environment variable, or repository directory.

- [ ] **Step 7: Run parser-wrapper tests and the local real parser**

```bash
node --test tests/architecture/figma-code-connect.test.mjs
npm run figma:generate
node scripts/verify-figma-code-connect.mjs
```

Expected: the boundary suite passes; the real parser exits 0, reads only its temporary output file, matches ready manifest entries, and leaves no temporary directory.

- [ ] **Step 8: Update root scripts with verified Code Connect 1.5.0 flags**

Set these exact scripts:

```json
{
  "figma:parse": "node scripts/verify-figma-code-connect.mjs",
  "figma:publish:dry-run": "npm run figma:publish-check && npm run figma:parse && figma connect publish --config figma.config.json --dry-run --skip-update-check --exit-on-unreadable-files",
  "figma:publish": "npm run figma:publish-check && npm run figma:parse && figma connect publish --config figma.config.json --skip-update-check --exit-on-unreadable-files"
}
```

The wrapper's exact parse arguments include the source-verified Code Connect 1.5.0 `--outFile`, `--skip-update-check`, and `--exit-on-unreadable-files` flags. The publish commands retain the source-verified `--skip-update-check`, `--exit-on-unreadable-files`, and `--dry-run` flags. Do not add `--force` or `--skip-validation`. A successful `figma:publish:dry-run` proves authenticated API validation only and must never be recorded as publication.

- [ ] **Step 9: Regenerate and verify draft artifacts**

```bash
npm run figma:generate
npm run figma:check
npm run figma:parse
npm run agent:check
```

Expected: all four commands exit 0. `figma/library.json` contains the four variable collections, text/effect styles, token source provenance, schema version 2, stable components, and sorted readiness issues. The local parser validates its bounded regular output file and exactly matches ready manifest entries without treating stdout/stderr as data. `figma:publish-check` remains red until Task 5 completes.

- [ ] **Step 10: Commit deterministic generation**

```bash
git add scripts/generate-figma.mjs scripts/verify-figma-code-connect.mjs tests/architecture/figma-code-connect.test.mjs figma/popcandy.figma.json figma.config.json package.json figma/library.json figma/manifest.json agent/manifests/figma.json figma/code-connect
git commit -m "feat: enforce fail-closed Figma generation"
```

### Task 5: Build and review the real Figma library at the external approval boundary

**Files:**

- Modify: `figma/popcandy.figma.json`
- Modify: `packages/figma/README.md`
- Create: `docs/FIGMA.md`
- Generate: `figma/library.json`
- Generate: `figma/manifest.json`
- Generate: `agent/manifests/figma.json`
- Generate: `figma/code-connect/*.figma.ts`

**Interfaces:**

- Consumes: exact node URLs, component keys, token bindings with `variable`, `text-style`, or `effect-style` kind and real Figma keys, owner name, Figma file version, publish/review timestamps, component anatomy/properties, accessibility notes, usage guidance, and mapping dates copied from the owner-reviewed Figma file.
- Produces: a locally green publication check and authenticated Code Connect dry-run; actual publication remains a separate approved external write.

- [ ] **Step 1: Write the owner runbook before requesting access**

Document this exact sequence in `docs/FIGMA.md`:

1. Build primitive tokens as the `Foundation`, `Theme`, `Density`, and `Accent` variable collections from `figma/library.json` without renaming tokens; build composite typography as text styles and shadows as effect styles.
2. Create only the declared modes; do not create a `system` mode.
3. Build one component set per stable catalog component using its generated anatomy, variants, properties, and semantic token bindings.
4. Attach generated usage guidance and accessibility notes to the component documentation.
5. Publish the library under the named owner and record the Figma file version.
6. Copy each real component node URL, component key, token binding kind and required key or mode-key set, and mapping date into `figma/popcandy.figma.json`.
7. Obtain a second maintainer review of the public entrypoint, Storybook ID, anatomy, property mapping, a11y notes, and usage guidance.
8. Run the unauthenticated local checks before any Code Connect dry-run or publication.

- [ ] **Step 2: Stop and request explicit Figma owner approval**

Present `figma/library.json`, the current readiness issue list, expected seat/budget impact, target Figma file, and named publisher. Do not open or mutate the owner’s Figma file until they authorize that exact file and action.

Expected if approval or access is absent: mark Task 5 externally blocked and leave `figma:publish-check` red. Do not fabricate node URLs, component keys, variable/style keys, people, dates, or file versions.

- [ ] **Step 3: After approval, construct and publish the design library**

The authorized Figma owner performs the runbook against the exact generated library manifest. Record only non-secret identifiers and evidence in `figma/popcandy.figma.json`; keep access tokens outside the repository.

- [ ] **Step 4: Regenerate and validate every stable mapping locally**

Run:

```bash
npm run figma:generate
npm run figma:check
npm run figma:publish-check
npm run figma:parse
```

Expected: all commands exit 0; ready component IDs exactly equal stable catalog component IDs, every represented token has a real binding of the required kind, every node belongs to the configured file, local parser output matches the manifest, and generated imports match documented public entrypoints.

- [ ] **Step 5: Request authorization for an authenticated dry run**

After the owner approves the local manifest, supply the token only through the Figma CLI’s supported environment or secure prompt mechanism and run:

```bash
npm run figma:publish:dry-run
```

Expected: exit 0 with all Code Connect documents accepted by authenticated API validation and no repository file changes. This result does not publish mappings and cannot be used as publication evidence. Redact token-bearing environment output from captured evidence.

- [ ] **Step 6: Request separate authorization for Code Connect publication**

Show the dry-run output, exact mapping count, configured file URL, mapping date, package/catalog version, and rollback owner. Only after explicit approval run:

```bash
npm run figma:publish
```

Expected: Code Connect publishes the reviewed mappings without `--force` and without skipping validation.

- [ ] **Step 7: Commit reviewed evidence and runbook**

```bash
git add figma/popcandy.figma.json packages/figma/README.md docs/FIGMA.md figma/library.json figma/manifest.json agent/manifests/figma.json figma/code-connect
git commit -m "docs: record published Figma library evidence"
```

### Task 6: Enforce the Figma-specific `1.0` gate

**Files:**

- Create: `scripts/verify-figma-1-0-readiness.mjs`
- Modify: `package.json`
- Modify: `docs/FIGMA.md`
- Test: `packages/figma/test/config.test.ts`

**Interfaces:**

- Consumes: current catalog, projected token manifest, schema-v2 config, generated manifest, and Code Connect templates.
- Produces: `npm run figma:1.0-check`, a read-only non-zero/zero release gate.

- [ ] **Step 1: Add failing `1.0` readiness assertions**

Add a pure helper `validateFigmaOneZeroReadiness(...)` and tests that reject:

- any cross-source token mismatch or unsupported token classification;
- any stable component not `ready`;
- any stable component token without a real binding, or with a binding kind that disagrees with its primitive-variable, typography-text-style, or shadow-effect-style projection;
- any absent anatomy, variant/property contract, accessibility note, or usage guidance;
- any missing/duplicate node URL or component key;
- any public import that differs from catalog entrypoints;
- any missing Storybook contract ID;
- any mapping date older than the current Figma file publication date;
- absent publishing owner, file version, review owner, or review date;
- any beta, experimental, deprecated, or nonexistent component presented as stable Figma coverage.

- [ ] **Step 2: Run the focused test and observe failure**

```bash
node --experimental-strip-types --test packages/figma/test/config.test.ts
```

Expected: FAIL because the `1.0` helper and command do not exist.

- [ ] **Step 3: Implement the read-only gate**

The script reads sources and generated files, invokes the helper, prints sorted issues, and exits 1 when any issue exists. It must not rewrite generated files or call Figma. Add:

```json
{
  "figma:1.0-check": "node --experimental-strip-types scripts/verify-figma-1-0-readiness.mjs"
}
```

- [ ] **Step 4: Run the complete local Stage 4A gate**

```bash
npm run figma:check
npm run figma:publish-check
npm run figma:parse
npm run figma:1.0-check
npm run agent:check
npm run test:pure
npm run verify
pnpm typecheck
pnpm build
```

Expected: every command exits 0. The three token sources agree, the exact stable catalog set has real Figma variable/style coverage, parserless Code Connect's bounded regular output file matches the manifest and is removed with its temporary directory, generated artifacts are current, private tooling builds, and no public-package contract changed.

- [ ] **Step 5: Perform human traceability sampling**

Choose one stable component from each public visual package (`@unpopping-candy/ui` and `@unpopping-candy/social`) and verify in Figma Dev Mode:

- the component node opens from `manifest.json`;
- light/dark/high-contrast, density, and accent variables resolve as declared where applicable, while typography and shadows resolve through the recorded text/effect styles;
- variant/property changes alter the generated public code snippet correctly;
- the Storybook contract link, usage guidance, and accessibility notes match the catalog;
- the code imports only the documented public entrypoint.

Record component ID, node URL, Figma file version, browser/app version, reviewer, date, result, and any finding in the owner-approved release evidence. A mismatch keeps `1.0` blocked.

- [ ] **Step 6: Commit the release gate**

```bash
git add scripts/verify-figma-1-0-readiness.mjs package.json docs/FIGMA.md packages/figma/test/config.test.ts
git commit -m "feat: gate 1.0 on Figma traceability"
```

## Stage 4A completion boundary

Stage 4A is complete only when all three token sources cross-validate; every required token has a real variable/text-style/effect-style binding; the local parserless gate reads a bounded regular `--outFile`, matches the manifest, and cleans its temporary directory; the owner-authorized authenticated dry-run is green; actual publication was separately authorized and observed; all stable components pass the Figma-specific `1.0` check; and human Dev Mode sampling is recorded. The authenticated dry-run is never publication evidence. This plan satisfies only the Figma criterion for `1.0`; the adoption, upgrade, support, resolver, compatibility, accessibility, security, and release gates in the approved competitive-library design still apply.
