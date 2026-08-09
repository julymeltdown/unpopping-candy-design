---
name: commonspace-ui
description: Use whenever a task creates, changes, reviews, or migrates a React interface that should use Commonspace UI components, tokens, patterns, or templates.
license: UNLICENSED
compatibility: Requires Node.js 22+ and @commonspace/cli 0.2.x or a repository checkout.
metadata:
  author: Commonspace
  version: "0.2.0"
allowed-tools: Bash Read Grep Glob
---

# Commonspace UI

Use this skill before writing interface code.

## Required sequence

1. Run `commonspace info --json` from the target project.
2. Read the installed version and package list. Do not assume the latest API.
3. Run `commonspace search "<task>" --json`.
4. Run `commonspace compose "<task>" --json` for a page, workflow, or multi-component region.
5. Inspect each selected entry with `commonspace get <id> --json`.
6. Implement only with documented public entrypoints and consumer-owned state.
7. Add or update Storybook stories for loading, empty, populated, error, disabled, pending, responsive, dark, and high-contrast states that apply.
8. Run `commonspace validate . --json` and then Storybook interaction and accessibility checks.

## Non-negotiable rules

- Never import `@commonspace/*/src/*` or `dist/*`.
- Never invent a component, prop, token, or Story ID.
- Keep fetch, router, auth, Query, SWR, Zustand, and application slices outside visual packages.
- Use `--cs-*` semantic or component tokens rather than hardcoded visual values.
- Keep content dominant; avoid ornamental gradients, glass, excessive pills, fake metrics, and nested card grids.
- Preserve native semantics, visible focus, accessible names, 320px reflow, 200% zoom, and reduced motion.

Read [component discovery](references/component-discovery.md) for lookup discipline and [state and accessibility](references/state-and-accessibility.md) before final validation.
