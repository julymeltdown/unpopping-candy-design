# Unpopping Candy Competitive Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved trust-first roadmap as independently reviewable releases, ending with a competitive stable `0.3.0` and separately gated post-`0.3` platform work.

**Architecture:** Work proceeds vertically: each component stage must complete a flagship social workflow across package API, metadata, Storybook, accessibility, clean consumer fixtures, and agent guidance. Platform work that has independent operational or security risk is isolated into its own plan and cannot silently expand the stable `0.3.0` scope.

**Tech Stack:** React 18.3/19, TypeScript, Vite 8, React Aria Components 1.20.0, Storybook 10.5, Vitest 4 browser mode, Playwright, pnpm 11, Changesets, GitHub Actions, Chromatic, Figma Code Connect, MCP.

## Global Constraints

- Public brand: `Unpopping Candy`; public command: `popcandy`; do not introduce `commonspace` names.
- Public packages: `tokens`, `theme`, `icons`, `ui`, `social`, `knowledge`, `registry`, `cli`, and `mcp`; `evals` and `figma` remain private repository tooling.
- React peer range: `>=18.3 <20`; Node runtime: `>=22.13` and the Node 24 release line; TypeScript declaration floor: 5.7.
- Published packages are ESM with explicit `exports`; CommonJS and undocumented deep imports are unsupported.
- Supported fixture pins: npm `10.9.9` and `11.19.0`, pnpm `10.34.5` and `11.21.0`, and Yarn Berry (`@yarnpkg/cli-dist`) `4.18.0` with the `node_modules` linker. The repository itself remains pinned to pnpm `11.4.0`; Yarn Plug'n'Play is unverified and must fail closed when exact resolution is unavailable.
- UI and social packages must not own fetching, routing, auth, authorization, caches, API DTOs, or business workflow state.
- React Aria Components is an internal behavior dependency; raw React Aria prop bags and implementation-specific names do not become public contracts.
- Use semantic `--popcandy-*` tokens, `.popcandy-*` classes, and stable `data-popcandy-*` state attributes.
- Every public component and exported subcomponent requires a stable catalog ID, typed public props, native/ref behavior, adjacent metadata, a dedicated Storybook contract, accessibility evidence, generated artifacts, a clean consumer fixture, and a Changeset.
- Accessibility target: WCAG 2.2 AA; deterministic axe and keyboard checks plus release evidence for Safari/VoiceOver, Chrome/NVDA, and real iOS Safari.
- Browser evidence has three non-interchangeable layers: Storybook Vitest interaction/axe contracts, Playwright Chromium/Firefox/WebKit workflow coverage, and dated owner-run browser/assistive-technology evidence. Passing one layer never implies another ran.
- Stable `0.3.0` is published under `latest` only after Stages 0–3 pass. Intermediate `0.3.0-alpha.N` and `0.3.0-beta.N` releases use `next`.
- Normal Changesets accumulate unconsumed on the source branch until the stable cut. Prerelease versions are prepared only in an ephemeral staging workspace, so a `next` candidate never rewrites source manifests, internal ranges, the lockfile, or Changesets.
- `scripts/run-compatibility-matrix.mjs` and `pnpm fixtures:compat` are the only packed-consumer matrix engine. Stage scenarios register under `fixtures/compatibility/scenarios/` and select themselves with `--fixture`; Storybook workflow fixtures are presentation sources, not competing install harnesses.
- Stage 0 owns immutable cumulative bundle allocations for Stages 0–3. Later stages select an allocation with `pnpm bundle:check -- --stage ...` and may lower, but never raise, its ceiling.
- Registry writes remain dry-run by default and require explicit approval. Generated files are regenerated from sources and never edited directly.
- External publication, paid services, repository settings, Figma upload, credentials, and externally reachable infrastructure require explicit owner authorization.

---

## Plan set and dependency order

| Order | Plan                                                                                 | Depends on                                      | Independently testable outcome                                                                                                                     |
| ----: | ------------------------------------------------------------------------------------ | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
|     0 | [Foundation](./2026-08-11-unpopping-candy-stage-0-foundation.md)                     | Approved design                                 | Trustworthy version resolution, runnable Storybook tests, honest README, real-eval harness, release/compatibility gates, `0.3.0-alpha.0` candidate |
|     1 | [Forms](./2026-08-11-unpopping-candy-stage-1-forms.md)                               | Stage 0                                         | Publish-a-post workflow with accessible choice and collection controls                                                                             |
|     2 | [Interactions](./2026-08-11-unpopping-candy-stage-2-interactions.md)                 | Stages 0–1                                      | Moderation workflow with accessible overlays, menus, and disclosure                                                                                |
|     3 | [Navigation and data](./2026-08-11-unpopping-candy-stage-3-navigation-data.md)       | Stages 0–2                                      | Activity workflow, stable-launch evidence, and `0.3.0` candidate                                                                                   |
|    4A | [Figma traceability](./2026-08-11-unpopping-candy-stage-4a-figma.md)                 | Stable public APIs                              | Real variables, variants, nodes, and verified Code Connect mappings                                                                                |
|    4B | [Hosted documentation MCP](./2026-08-11-unpopping-candy-stage-4b-hosted-docs-mcp.md) | Stable public catalog                           | Read-only, bounded public documentation service                                                                                                    |
|    4C | [Remote Registry](./2026-08-11-unpopping-candy-stage-4c-remote-registry.md)          | Documented adopter demand and separate approval | Signed, bounded, SSRF-resistant remote registry transport with unchanged local write approval                                                      |

Do not execute 4B or 4C merely because earlier work is complete. Their demand, owner, budget, credentials, retention policy, and incident responsibility are entry gates, not implementation details.

## Release lanes

```text
Stage 0  0.3.0-alpha.0  foundation, local AI proof, package alignment
Stage 1  0.3.0-alpha.1  first forms and publish-a-post candidate
Stage 2  0.3.0-beta.0   first interactions and moderation candidate
Stage 3  0.3.0-beta.1   navigation/data candidate, still under next
          ↓ all stable-launch gates
         0.3.0 latest

Stage 4A/4B/4C use later coordinated minors; they do not rewrite 0.3 history.
```

The numbered prereleases above are the first planned candidates. Follow-up fixes increment the matching alpha or beta counter. `release:candidate` calculates and packs each prerelease in a temporary workspace and leaves the source tree unchanged. After all Stage 3 gates pass, `pnpm version-packages` consumes the accumulated source Changesets once, coordinates the nine public packages at stable `0.3.0`, regenerates compatibility metadata, and prepares the `latest` tarballs. Neither path authorizes publication.

## Execution contract

### Task 1: Create isolated execution state

**Files:**

- Read: `docs/superpowers/specs/2026-08-10-unpopping-candy-competitive-library-design.md`
- Read: the selected stage plan from the table above
- Do not modify the current `master` worktree during implementation setup

**Interfaces:**

- Consumes: approved design commit `56588bd20250ff63e73d157cd5e7530e1eb6db8f`
- Produces: one isolated worktree and branch for the selected stage

- [ ] **Step 1: Verify the approved design and clean base**

Run:

```bash
git show --stat --oneline 56588bd20250ff63e73d157cd5e7530e1eb6db8f
git status --short
git branch --show-current
```

Expected: the design commit is present, the current worktree is clean, and the base branch is `master`.

- [ ] **Step 2: Use the required worktree skill**

Invoke `superpowers:using-git-worktrees` and create a branch named for the selected plan, for example `stage-0-foundation`.

- [ ] **Step 3: Record the baseline**

Run:

```bash
npm run agent:check
npm run test:pure
npm run verify
pnpm typecheck
pnpm build
```

Expected: all five commands exit 0 before implementation. Also run the selected plan's explicit red test; a known red test is not a baseline failure when the plan names it.

### Task 2: Enforce stage review and commit boundaries

**Files:**

- Modify only files named by the selected stage plan
- Add generated files only in the same commit as their canonical source change

**Interfaces:**

- Consumes: task-level test and file lists from the selected plan
- Produces: atomic commits that can be reviewed or reverted independently

- [ ] **Step 1: Execute one task at a time**

Use TDD order for every behavior: failing test, observed failure, minimal implementation, focused pass, full relevant gate.

- [ ] **Step 2: Review every public component before continuing**

Run:

```bash
npm run popcandy -- search "audience choice control" --json
npm run popcandy -- get ui.checkbox --json
npm run agent:generate
npm run agent:check
pnpm --filter @unpopping-candy/docs test
```

Expected: for the Stage 1 example, catalog discovery returns the implemented `ui.checkbox` contract, generated output is stable, and the Storybook browser project passes interaction and axe checks. Stages 2 and 3 use the exact search phrase and stable IDs listed in their own component tasks.

- [ ] **Step 3: Commit only the task's atomic group**

Run:

```bash
git diff --check
git diff --stat
git diff --staged --check
git diff --staged --stat
```

Between `git diff --stat` and `git diff --staged --check`, run the exact `git add` command printed in the current stage task. After inspecting the staged diff, run that task's exact `git commit` command. Expected: no unrelated paths are staged.

### Task 3: Run the stage exit gate

**Files:**

- Verify: all changed sources, generated manifests, documentation, fixtures, and Changesets

**Interfaces:**

- Consumes: the stage's completed tasks
- Produces: a reviewed prerelease or stable candidate; publication remains separately authorized

- [ ] **Step 1: Run complete repository verification**

```bash
npm run agent:check
npm run test:pure
npm run verify
pnpm typecheck
pnpm build
pnpm --filter @unpopping-candy/docs test
```

Expected: every command exits 0. Storybook's a11y configuration treats violations as errors.

- [ ] **Step 2: Run stage-specific clean-consumer and evidence gates**

Use the exact `fixtures:compat -- --fixture ...`, `bundle:check -- --stage ...`, browser, model-eval, and release-candidate commands in the selected plan. Never substitute a workspace-alias build for a packed-artifact fixture. Automated commands must not be reported as substitutes for owner-run model, assistive-technology, Figma, or deployment evidence.

- [ ] **Step 3: Request code and product review**

Invoke `superpowers:requesting-code-review`. For visible component stages, also run the repository's browser and visual QA workflow. For Stage 4C, run the security review named in its plan.

- [ ] **Step 4: Stop at external approval boundaries**

Do not publish npm packages, deploy Pages, spend Chromatic/model/device-cloud budget, upload Figma, or expose an MCP/Registry endpoint until the owner authorizes that exact action after reviewing the dry-run evidence.

## Definition of done for this plan set

- Each linked plan exists, contains exact file responsibilities and test-first steps, and can be executed independently after its declared dependencies.
- Stages 0–3 complete the three flagship workflows and produce stable `0.3.0` evidence.
- Stage 4 work remains separately gated and cannot weaken local Registry safety or public package boundaries.
- The final release report lists executed commands, exact browser/AT versions, package provenance, model-eval timestamps, known warnings, and any external gate that remains unexecuted.
