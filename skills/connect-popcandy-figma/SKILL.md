---
name: connect-popcandy-figma
description: Use when mapping Unpopping Candy components to Figma Code Connect, validating Figma component properties, or preparing Code Connect publication.
license: MIT
compatibility: Requires the Unpopping Candy monorepo, Node.js >=22.13.0 <23 or >=24 <25, Figma Code Connect 1.5+, and access to the target Figma library.
metadata:
  author: Unpopping Candy
  version: "0.2.0"
allowed-tools: Bash Read Grep Glob
---

# Connect Unpopping Candy to Figma

1. Run `popcandy info --json` and confirm the installed Unpopping Candy package versions.
2. Read `figma/popcandy.figma.json` and `agent/manifests/figma.json`. Do not invent a Figma node URL.
3. Use the Figma component's **Copy link to selection** URL and add it under the exact catalog component ID.
4. Inspect the component contract with `popcandy get <component-id> --json` before mapping Figma properties.
5. Keep Code Connect imports on documented public Unpopping Candy entrypoints.
6. Run `npm run figma:generate` and review the generated parserless `.figma.ts` template.
7. Run `npm run figma:check` for repository consistency.
8. Run `npm run figma:publish-check`; publishing is forbidden while any placeholder mapping remains.
9. Preview or parse the exact file before publication, then publish with an explicit token supplied by the operator.
10. Never place a Figma access token in config, generated manifests, Git history, MCP output, or screenshots.

Read [mapping rules](references/mapping-rules.md) before changing property names or template examples.
