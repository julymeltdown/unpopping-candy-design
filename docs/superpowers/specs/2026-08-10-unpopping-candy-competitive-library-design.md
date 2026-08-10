---
title: Unpopping Candy competitive public-library design
date: 2026-08-10
status: awaiting-user-review
owner: Unpopping Candy
---

# Unpopping Candy competitive public-library design

## Summary

Unpopping Candy will be a public React design system for social and collaboration products. It will combine a polished, accessible UI layer with an AI-native contract layer that can identify the versions actually installed in a consumer project, discover only supported capabilities, guide bounded composition, and verify the visible result.

The release strategy is trust-first and vertical. Each stage must complete a real adopter workflow across package API, catalog metadata, CLI guidance, Storybook evidence, accessibility, framework fixtures, and public documentation. A long catalog with shallow proof is not the goal.

The primary launch user is a React application developer working with a coding agent. Design-system maintainers and product designers are important secondary users. When their needs conflict, the first-use experience of that developer-agent pair wins unless it would compromise accessibility, API stability, or security.

## Settled decisions

1. The product has two reinforcing positions: a styled system specialized for social/collaboration interfaces and an AI-native design-system platform.
2. Public packages are `tokens`, `theme`, `icons`, `ui`, `social`, `knowledge`, `registry`, `cli`, and `mcp`. `evals` and `figma` remain repository tooling until their contracts stabilize.
3. The command-line name is `popcandy`; `commonspace` is not a public command or brand.
4. React Aria Components is the behavioral foundation for new complex interaction components, wrapped behind Unpopping Candy APIs and styling contracts.
5. Competitive component coverage is delivered in three component stages after a foundation stage.
6. The Figma library is code-first because no canonical Figma library exists yet.
7. Storybook is published through GitHub Pages and visual review is provided by Chromatic.
8. Deterministic catalog and fixture checks run on pull requests. Real Codex and Claude evaluation runs are scheduled nightly and can also be triggered manually.
9. The supported React range is React 18.3 through React 19. Supported framework combinations are explicit tested cells, not an implied Cartesian product.
10. Accessibility targets WCAG 2.2 AA, automated axe and keyboard checks, and release-cadence evidence from VoiceOver/Safari and NVDA/Chrome.
11. All public packages move together on the `0.3.0` line. Foundation and component stages publish `0.3.0-alpha.N` and `0.3.0-beta.N` under the `next` tag. Stable `0.3.0` moves to `latest` only after the third component stage passes every launch gate.

## Product proof: three flagship workflows

Generic primitives are necessary but do not prove the social/collaboration position. The same three workflows must anchor component prioritization, README examples, Storybook contracts, framework fixtures, and model evaluations.

### 1. Publish a post with audience controls

- Actor: a member publishing content in a community or workspace.
- Friction to remove: composing content, selecting an audience, understanding validation, and seeing pending, success, and failure states without custom control plumbing.
- Required system capabilities: existing social composition, form controls from Stage 1, clear field errors, pending actions, keyboard operation, and consumer-owned submission state.
- Success evidence: an adopter can implement the supported flow from catalog guidance without inventing imports, props, tokens, or state ownership.

### 2. Review a member and take a moderation action

- Actor: a moderator or workspace administrator.
- Friction to remove: inspecting context and choosing a safe action through discoverable menus and disclosures.
- Required system capabilities: existing profile and social surfaces plus Menu, Popover, Tooltip, Disclosure, and confirmation composition from Stage 2.
- Success evidence: destructive and non-destructive actions are distinguishable, keyboard reachable, correctly announced, and leave authorization and mutation ownership in the application.

### 3. Review notifications or collaborative activity

- Actor: a member triaging recent activity.
- Friction to remove: understanding hierarchy, navigating pages, and reviewing structured activity without the design system owning server data.
- Required system capabilities: breadcrumbs, pagination, progress, semantic tables, and controlled interactive collections from Stage 3.
- Success evidence: the same contract works in supported Vite, Next.js, and React Router fixtures with application-owned routing, filtering, pagination, selection, and fetching.

Every component stage must materially improve at least one flagship workflow. Components that do not do so require separate evidence of widespread adopter need.

## Public API and design rules

### Behavioral boundaries

- React Aria internals and raw prop bags do not leak into the public API.
- Public props use Unpopping Candy naming, semantic variants, tokens, and documented data attributes.
- Existing components are not rewritten merely for consistency; they move to React Aria only when a verified behavior or accessibility gap justifies the migration.
- Presentation packages never own fetching, routing, authentication, authorization, mutations, server caches, API DTOs, or business workflows.
- Components support controlled and uncontrolled use where the underlying interaction genuinely supports both.
- Form controls preserve native form behavior, names, values, required state, reset behavior, validation semantics, refs, and native-element escape hatches.
- Version `0.3` does not introduce a universal `Field` abstraction. Each control documents its label, description, error, grouping, and form contract. Shared field anatomy can be proposed after repeated real usage demonstrates a stable abstraction.

### Collections and data display

- `ListBox`, its items, and its sections are public because Select and ComboBox need a coherent reusable collection contract.
- Stage 3 publishes two distinct APIs:
  - `Table` is native, non-interactive semantic data presentation. It does not add grid focus or selection behavior.
  - `DataGrid` is an explicitly interactive React Aria collection with controlled selection and a documented grid focus and keyboard model.
- Sorting, filtering, pagination state, virtualization, fetching, persistence, and server ownership remain application concerns in both APIs.
- Consumers cannot switch a mounted surface between `Table` and `DataGrid` modes; they are different contracts, roles, and focus models.

### Styling, internationalization, and tokens

- Styling uses semantic tokens and stable state data attributes. Version `0.3` does not add a recipes DSL.
- Public examples do not hardcode a value for which a semantic token exists.
- Components contain no hardcoded English UI. Visible labels, empty text, and action text are consumer-supplied or come from an explicitly documented locale-aware source.
- RTL layout and directional keyboard behavior are tested where applicable. Consumer locale and document direction remain application inputs.
- Calendar, date, time, and number-formatting controls are outside the `0.3` scope.

### Public contribution contract

A public component is incomplete until it has all of the following:

- a stable export and typed props;
- a stable catalog ID and the complete public contract for every exported named subcomponent; implementation-only subcomponents remain unexported;
- ref and native-element behavior;
- adjacent `*.docs.ts` guidance;
- token, state, keyboard, form, and accessibility contracts as applicable;
- dedicated Storybook contract stories for visible and interactive states;
- interaction, accessibility, and non-visual logic tests;
- catalog, portable agent documentation, and internal Figma-template generation updates;
- a clean-package consumer fixture;
- an appropriate Changeset;
- bundle-impact evidence against the stage budget.

## Version and compatibility contracts

### Installed-version resolution

`popcandy info`, `search`, `get`, `compose`, and `validate` must use one observable resolver contract:

1. Resolve each installed `@unpopping-candy/*` package manifest from the target project using Node package resolution. A resolved package manifest is the primary authority, including workspace-linked and symlinked packages.
2. If package manifests cannot be resolved because dependencies are not installed, fall back only to supported lockfiles: npm `package-lock.json` lockfile version 3 and pnpm lockfile version 9.
3. Yarn 4 is supported in `node_modules` linker mode when installed manifests are resolvable. Yarn Plug'n'Play and lockfile-only Yarn resolution are explicitly unverified in `0.3` and fail closed with guidance.
4. Compare the complete resolved package set with a generated compatibility manifest that maps valid public-package version sets to exactly one knowledge-catalog version.
5. Prerelease versions must map explicitly. Mixed versions are rejected unless that exact combination appears in the compatibility manifest.
6. Never silently fall back to the repository's current catalog, a package range, or the newest available version.

Machine-readable failures use stable codes, including `POPCANDY_PROJECT_NOT_FOUND`, `POPCANDY_DEPENDENCIES_NOT_INSTALLED`, `POPCANDY_LOCKFILE_UNSUPPORTED`, `POPCANDY_PNP_UNSUPPORTED`, `POPCANDY_VERSION_SET_MIXED`, and `POPCANDY_CATALOG_INCOMPATIBLE`.

### Runtime and package format

- React peer dependency: `>=18.3 <20`.
- CLI and MCP runtime: supported Node.js 22.13+ and 24.x release lines.
- Type declarations target TypeScript 5.7+ and are verified in a clean consumer fixture rather than inferred from the repository compiler.
- Published packages are ESM with standards-based `exports`, explicit type entry points, and no undocumented deep imports. CommonJS is not a supported public contract in `0.3`.
- Supported consumers are npm 10/11, pnpm 10/11, and Yarn 4 with the `node_modules` linker. Exact package-manager and lockfile versions are recorded in fixture evidence.

### Tested framework cells

The release matrix contains these valid cells; unlisted combinations are unverified rather than implicitly supported:

| Fixture                  | React | Framework contract |
| ------------------------ | ----- | ------------------ |
| Vite                     | 18.3  | Vite 8 application |
| Vite                     | 19    | Vite 8 application |
| Next.js App Router       | 18.3  | Next.js 15         |
| Next.js App Router       | 19    | Next.js 15         |
| Next.js App Router       | 19    | Next.js 16         |
| React Router data router | 18.3  | React Router 7     |
| React Router data router | 19    | React Router 7     |

Each fixture records exact dependency versions and installs packed artifacts from a clean directory without workspace aliases.

## Delivery sequence

### Stage 0 — adoption and trust foundation

Stage 0 establishes measured proof before catalog expansion:

- Replace the current long-form README with a 200–300 line landing document that explains the product, differentiator, honest current scope, a runnable quickstart, one local AI-assisted workflow, proof links, package map, limitations, and contribution path.
- Publish a local-only end-to-end case study for the currently implementable slice of the publish-a-post workflow: prompt, project/version detection, `search`/`get`/`compose`, implementation, Storybook interaction, accessibility, and visual verification. Include prompt, inputs, output, model metadata, failures, and a no-`popcandy` comparison. Stage 1 extends the same case study with audience and publishing controls.
- Make installed-version resolution follow the authority contract above and expose the result through `popcandy info --json`.
- Make search output explain benchmark, unsupported, deprecated, and incompatible results rather than silently omitting them.
- Separate deterministic static evaluation fixtures from real model evaluation. Real captures include prompt, bounded context, raw output, provider/model, timestamp, evaluator version, repetition number, result, reason, token usage, and estimated cost.
- Run five repetitions per task and model. Public model claims must be reproducible, linked to captures, and no older than 30 days.
- Report confidence intervals over repeated model runs and keep model evaluation non-blocking until the baseline, variance, and budget are accepted by the project owner; deterministic contract failures remain blocking.
- Publish the compatibility, accessibility, support, security, and package/version policies.
- Verify MIT license consistency in the root and every published package.
- Confirm ownership of the `@unpopping-candy` npm namespace and the right to use the project branding before public promotion.
- Establish per-package and per-component gzip bundle baselines and numeric ceilings before Stage 1 begins. A later stage cannot merge by merely updating a baseline upward.
- Configure trusted npm publishing, the `next` prerelease channel, GitHub Pages Storybook, Chromatic, and release provenance.

### Stage 1 — forms and choice

Deliver the smallest coherent form and choice family:

- Checkbox and CheckboxGroup;
- Radio and RadioGroup;
- Switch;
- Select, SelectItem, and SelectSection;
- ComboBox;
- ListBox, ListBoxItem, and ListBoxSection.

The publish-a-post flagship workflow must use these public controls for audience and publishing choices and demonstrate default, hover, focus-visible, selected, disabled, invalid, required, pending, empty, and long-content states where relevant.

### Stage 2 — actions and disclosure

Deliver interaction surfaces needed for moderation:

- Menu, MenuTrigger, MenuItem, MenuSection, MenuSeparator, MenuCheckboxItem, and MenuRadioItem;
- Popover;
- Tooltip;
- Disclosure and Accordion.

The moderation workflow must show safe and destructive actions, nested or grouped choices where justified, focus restoration, escape behavior, outside interaction, disabled states, permission-denied presentation, and application-owned mutation/pending/error handling.

### Stage 3 — navigation and structured activity

Deliver navigation and basic structured data:

- Breadcrumbs and BreadcrumbItem;
- Pagination;
- Table for native non-interactive semantics;
- DataGrid for controlled interactive selection;
- Progress.

The activity workflow must demonstrate responsive layout, empty/loading/error/pending states, application-owned navigation and fetching, `Table` semantics, and the separate `DataGrid` focus and selection contract.

After Stage 3 passes all stable-launch gates, publish the unified stable `0.3.0` release under `latest`.

### Stage 4A — Figma traceability

Build the code-first Figma library from stable tokens, modes, component anatomy, variants, properties, and Storybook contracts. Replace placeholder node URLs with real published nodes and verify Code Connect mappings against the exact public API. Figma evidence includes accessibility notes, usage guidance, publishing owner, file version, and mapping date.

### Stage 4B — hosted documentation MCP

Offer a read-only hosted MCP for public catalog and documentation queries. Mutation tools stay local. The service returns versioned public content only, has rate and size limits, exposes no repository credentials or private project details, and sits behind a replaceable adapter so upstream protocol or Storybook integration changes cannot alter the public Unpopping Candy contract.

### Stage 4C — demand-gated remote Registry

Remote Registry distribution begins only after a concrete adopter demonstrates that npm plus the checksum-backed local Registry is insufficient. It is a separately threat-modeled project with:

- HTTPS-only origins and a configured origin allowlist;
- strict redirect limits and revalidation of every redirect target;
- private, loopback, link-local, and cloud-metadata address rejection;
- response byte, entry count, decompression, and timeout limits;
- signed manifests anchored to configured trusted keys, plus immutable source revisions and per-file digests in every receipt;
- checksum verification before writes;
- credential isolation with no cross-origin forwarding;
- DNS and resolved-address validation before connection and after every redirect, including rebinding-resistant checks;
- project-root containment for every normalized target, with absolute paths, traversal, symlink escapes, and registry-supplied shell or lifecycle commands rejected;
- dry-run output and explicit approval before every write;
- atomic local writes and auditable receipts.

Stage 4 does not block `0.3.0`. Figma traceability is required before `1.0`; hosted MCP and remote Registry graduate only when their adopter value and operating ownership are proven.

## Verification and evidence

### Pull-request gates

- generated-artifact drift and deterministic catalog checks;
- pure unit tests, type checks, package builds, and clean tarball installs;
- component interaction tests, axe checks, and documented keyboard scenarios;
- supported framework fixture tests for affected cells;
- Storybook build and Chromatic review for changed visible states;
- package export, deep-import, license, and bundle-budget checks;
- deterministic agent-output fixtures that reject invented imports, props, tokens, IDs, and state ownership.

### Nightly and release gates

- real Codex and Claude evaluation runs with five repetitions per task/model;
- full framework and package-manager fixture matrix;
- Playwright Chromium, Firefox, and WebKit coverage;
- release-cadence testing on actual Safari with VoiceOver on macOS and Chrome with NVDA on Windows;
- physical iOS Safari or an approved real-device service for the supported iOS release lines;
- full visual regression review and Storybook publication;
- clean consumer installation from the exact packed or published artifacts.

Browser and assistive-technology evidence records OS, browser, AT, component, scenario, result, tester, and date. A keyboard trap, inaccessible name, focus-loss defect, incorrect role/state, or blocking screen-reader failure is release-blocking for the affected component.

The public browser support window is the latest two stable major releases of Chrome, Edge, Firefox, desktop Safari, and iOS Safari at the date of each stable package release. The window rolls forward with releases; exact tested versions remain attached to release evidence.

## Launch and adoption gates

### Stable `0.3.0`

Stable promotion requires all of the following:

- all three flagship workflows pass in the documented framework cells from packed artifacts;
- at least four of five fresh evaluators, not involved in implementation, can install the library and complete the README quickstart plus one flagship workflow without maintainer intervention in 20 minutes or less;
- real-model runs achieve at least 90% valid-import/API/state-ownership compliance with `popcandy` context and improve by at least 20 percentage points over the no-context baseline across the published task set;
- no open P0 or P1 correctness, accessibility, security, package-resolution, or documentation defects;
- all public packages share the intended version and provenance, and rollback/deprecation instructions are rehearsed;
- the public README describes the exact `0.3.0` catalog and limitations, not the destination roadmap.

### Stable `1.0`

The project does not claim `1.0` API stability until:

- at least three representative applications across at least two independent teams have completed a flagship adoption path;
- two consecutive supported upgrade rehearsals succeed without undocumented breaking changes;
- support volume and unresolved defects are sustainable for the named maintainer ownership;
- every stable public component has real Figma variables, variants, accessibility notes, and verified Code Connect mapping;
- the version resolver, compatibility matrix, accessibility evidence, framework fixtures, and model evaluations have remained reliable through at least two release cycles.

## Support and release policy

- Before `1.0`, only the current minor line receives fixes. Security issues may cause an accelerated patch or documented withdrawal.
- Deprecated APIs remain documented for at least one minor line and include a migration path before removal.
- Breaking changes require a Changeset, migration note, catalog regeneration, fixture updates, and an explicit prerelease period.
- Intermediate `0.3.0-alpha.N` and `0.3.0-beta.N` releases use `next`; stable `0.3.0` alone uses `latest`.
- Failed releases are deprecated rather than silently replaced. Published provenance and changelogs remain immutable.

## External dependencies and approval boundaries

The following require project-owner credentials, account configuration, or explicit approval and therefore cannot be assumed by implementation agents:

- `@unpopping-candy` npm organization ownership and trusted-publishing configuration;
- confirmation that the package namespace and project branding can be used publicly;
- Chromatic project and token;
- GitHub Pages and repository environment settings;
- Figma team, project, canonical file, Code Connect eligibility, and publishing permissions;
- Codex and Claude credentials, approved budgets, retention rules, and secret handling for nightly evaluation;
- five independent onboarding evaluators for the `0.3.0` launch gate and representative pilot teams for the `1.0` gate;
- Windows/NVDA access and physical iOS devices or an approved device-testing service;
- maintainers and on-call ownership for any hosted MCP or remote Registry service.

Implementation may prepare dry runs, configuration templates, and validation scripts, but it must not publish packages, change repository settings, create paid services, upload a Figma library, or start externally reachable infrastructure without the corresponding authorization.

Real-model evaluations may send only approved public fixtures and bounded public catalog content. Prompts, outputs, and receipts must redact secrets, personal data, user-specific absolute paths, and private repository content before retention or publication.

## Principal risks and mitigations

- **Scope overwhelms quality.** Each stage is independently releasable and must complete a flagship workflow before another component family starts.
- **The library looks generic.** Public examples and evaluation tasks are organized around the three social/collaboration workflows, not a component gallery alone.
- **AI-native claims become marketing.** Claims link to recent real-model captures, comparison baselines, deterministic fixtures, and reproducible evaluator versions.
- **Version selection is nondeterministic.** Installed manifests are authoritative, supported lockfiles are limited fallbacks, version sets map to one generated catalog, and unsupported states fail closed.
- **React Aria leaks or inflates APIs.** Unpopping Candy owns its public contract and bundle budgets; implementation details remain replaceable.
- **Accessibility evidence is mistaken for automation.** CI and real browser/AT evidence are distinct and both are required for release claims.
- **Remote distribution expands the attack surface.** It is demand-gated, separately threat-modeled, read/plan/approval separated, and does not share hosted documentation credentials.
- **Figma drifts from code.** Code and Storybook define the initial model; published node IDs and Code Connect mappings are verified before traceability claims.

## Non-goals for `0.3`

- application state, fetching, routing, authentication, authorization, or domain workflow ownership;
- a universal form framework or generic `Field` abstraction;
- advanced data-grid features such as virtualization, sorting engines, filtering engines, editing, or server pagination;
- date, calendar, time, chart, editor, upload, or command-palette suites;
- public stability guarantees for `evals` or `figma` tooling;
- remote Registry writes or an externally reachable mutation service;
- claiming Yarn Plug'n'Play, unlisted framework cells, or untested browser/AT combinations as supported.

## Definition of success

The work succeeds when a new visitor can understand the product, see honest evidence, install it, and complete a flagship social/collaboration UI in a supported clean project; when a coding agent can select only APIs that exist for the actual installed package set; when every visible contract is backed by Storybook, accessibility, interaction, compatibility, and package evidence; and when stable promotion follows measured adopter outcomes instead of repository completeness alone.
