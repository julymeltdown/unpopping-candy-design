---
name: build-popcandy-interface
description: Use when building a new page, workflow, block, or application shell with Unpopping Candy from a functional requirement or visual reference.
license: MIT
compatibility: Requires the popcandy-ui skill and Unpopping Candy CLI 0.2.x.
metadata:
  author: Unpopping Candy
  version: "0.2.0"
allowed-tools: Bash Read Grep Glob
---

# Build a Unpopping Candy interface

1. Invoke the `popcandy-ui` skill and run project detection.
2. Translate the request into user tasks, information hierarchy, states, and responsive constraints before choosing components.
3. Search and compose with the CLI. Use the proposed template or pattern only when its semantic purpose matches.
4. Write a short implementation inventory: public imports, view models, consumer-owned state, actions, states, stories, and validation commands.
5. Scaffold with `popcandy scaffold <template> --dry-run` when a matching registry item exists. Review every proposed file before `--apply`.
6. Implement the smallest complete workflow. Keep business logic and network ownership in the consuming app.
7. Create Storybook stories and validate the actual browser surface.
8. Run Unpopping Candy validation, tests, accessibility checks, and a consumer build before reporting completion.

Use [composition](references/composition.md) and [responsive completion](references/responsive.md) as review checklists.
