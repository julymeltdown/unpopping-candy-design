# Unpopping Candy agent operating contract

This repository is an AI-operable design system. Agents must use the same structured knowledge, public package exports, Storybook contracts, and validation gates as human contributors.

## Mandatory workflow

Before changing interface code:

1. Detect the target project and installed Unpopping Candy versions.
   ```bash
   npm run popcandy -- info --path . --json
   ```
2. Search the installed catalog instead of inventing components or props.
   ```bash
   npm run popcandy -- search "profile settings" --json
   npm run popcandy -- compose "profile settings with loading, empty, error, and pending states" --json
   ```
3. Inspect every selected component, pattern, or template by stable ID.
   ```bash
   npm run popcandy -- get ui.text-field --json
   npm run popcandy -- get pattern.form-actions --json
   ```
4. Use only documented public imports and semantic tokens.
5. Keep server state, routing, authentication, and business workflow ownership outside `@unpopping-candy/ui` and `@unpopping-candy/social`.
6. Add or update Storybook stories for all visible states.
7. Validate the changed project and run Storybook interaction and accessibility checks.
   ```bash
   npm run popcandy -- validate --path . --json
   npm run verify
   ```

## Do not guess

Agents must not:

- invent a Unpopping Candy component, prop, token, template, Story ID, or import path;
- import from `@unpopping-candy/*/src`, `dist` internals, or repository-relative package internals;
- hardcode colors, spacing, radii, shadows, or gradients when a Unpopping Candy token exists;
- place `fetch`, TanStack Query, SWR, Zustand, routing, JWT, or API DTO ownership inside presentation packages;
- scaffold files outside the detected project root;
- run Registry writes without first returning a dry-run plan and obtaining explicit approval;
- mark a Figma Code Connect template as publishable while it still uses a placeholder node URL;
- claim Storybook, Figma, package-build, or browser verification without executing the corresponding command.

## Source of truth

Use these sources in this order:

1. `popcandy.config.json` for local integration paths;
2. `agent/manifests/catalog.json` for the exact installed knowledge catalog;
3. component-adjacent `*.docs.ts` metadata and public TypeScript source;
4. Storybook contract stories and `agent/manifests/stories.json`;
5. generated `DESIGN.md` and `agent/llms*.txt` as portable fallbacks;
6. migration and release documentation.

Generated files must never be edited directly. Change the component source, adjacent metadata, patterns, templates, or generator, then run:

```bash
npm run agent:generate
npm run agent:check
```

## Package boundaries

```text
tokens     → no runtime dependencies
theme      → React + tokens
icons      → React + Ant Design Icons
ui         → React + tokens + icons
social     → React + tokens + icons + ui
knowledge  → deterministic metadata and generators only
registry   → knowledge + guarded local filesystem actions
cli        → knowledge + registry + local project inspection
mcp        → thin adapter over CLI, knowledge, Registry, and tokens
evals      → knowledge-driven static agent-output evaluation
figma      → knowledge-driven Code Connect generation
```

## Public component contribution

A public component change is incomplete until it includes:

- a stable public export;
- typed props and ref/native-element behavior;
- component-adjacent `*.docs.ts` guidance;
- token and state contracts;
- a dedicated Storybook contract story;
- accessibility requirements;
- tests for non-visual logic;
- generated catalog, agent documents, and Figma template updates;
- an appropriate Changeset.

Read [`docs/COMPONENT_GUIDELINES.md`](./docs/COMPONENT_GUIDELINES.md) and the `author-popcandy-component` Skill before authoring a public component.

## Verification before completion

Run the complete available verification set and report exactly what executed:

```bash
npm run agent:check
npm run test:pure
npm run verify
pnpm typecheck
pnpm build
```

When dependencies are unavailable, the last two commands may be blocked. Report the blocker rather than extrapolating from syntax or pure tests.
