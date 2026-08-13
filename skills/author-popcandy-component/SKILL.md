---
name: author-popcandy-component
description: Use when adding or materially changing a public Unpopping Candy or social component, including its API, metadata, stories, tests, documentation, and release record.
license: MIT
compatibility: Requires the Unpopping Candy monorepo and Node.js >=22.13.0 <23 or >=24 <25.
metadata:
  author: Unpopping Candy
  version: "0.2.0"
allowed-tools: Bash Read Grep Glob
---

# Author a Unpopping Candy component

1. Run `popcandy search "<responsibility>" --json` and prove an existing component, variant, pattern, or composition cannot express the reusable responsibility.
2. Define purpose, use conditions, avoid conditions, controlled state, native element contract, accessibility, tokens, and package boundary before writing implementation code.
3. Write a failing behavior or contract test.
4. Implement the smallest API that passes. Preserve native props and ref behavior where practical.
5. Add component-adjacent `*.docs.ts` metadata with imports, guidance, states, tokens, examples, related entries, and Story IDs.
6. Add Storybook stories for variants, states, long content, keyboard focus, mobile, dark, high contrast, and reduced motion as applicable.
7. Run knowledge and agent generation. Generated files must be byte-stable and committed.
8. Run package tests, architecture gates, consumer fixture, Storybook interaction/accessibility checks, and bundle inspection.
9. Add a Changeset and migration entry when the public API changes.

Read [public API](references/public-api.md) and [metadata](references/metadata.md).
