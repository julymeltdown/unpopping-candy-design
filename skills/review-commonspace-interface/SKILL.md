---
name: review-commonspace-interface
description: Use when reviewing generated or hand-written React UI for Commonspace component reuse, design-token compliance, state completeness, accessibility, and product-pattern correctness.
license: UNLICENSED
compatibility: Requires Commonspace CLI 0.2.x; Storybook is recommended.
metadata:
  author: Commonspace
  version: "0.2.0"
allowed-tools: Bash Read Grep Glob
---

# Review a Commonspace interface

1. Run `commonspace info --json` and `commonspace validate . --json`.
2. Identify the user task, selected Commonspace pattern, and expected states.
3. Search the catalog for every custom control or duplicated pattern. Flag invented or bypassed APIs.
4. Review public imports, token use, data ownership, semantic DOM, focus, keyboard behavior, announcements, reflow, zoom, themes, and reduced motion.
5. Inspect Storybook stories and browser behavior; static source review is insufficient for overlays, focus, and responsive states.
6. Report findings by severity with exact file, behavior, relevant catalog entry, and a concrete repair.
7. Re-run validation and the affected stories after fixes.

Use [review rubric](references/review-rubric.md) for severity and evidence.
