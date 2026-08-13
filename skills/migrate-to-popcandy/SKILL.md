---
name: migrate-to-popcandy
description: Use when replacing an existing React UI library, custom component set, or copied markup with Unpopping Candy while preserving application behavior.
license: MIT
compatibility: Requires Unpopping Candy CLI 0.2.x and access to the existing application tests.
metadata:
  author: Unpopping Candy
  version: "0.2.0"
allowed-tools: Bash Read Grep Glob
---

# Migrate to Unpopping Candy

1. Run `popcandy info --json` and inspect current dependencies, source roots, CSS entrypoints, and Unpopping Candy versions.
2. Inventory existing primitives, composite patterns, route shells, state ownership, and visual exceptions.
3. Run `popcandy search` for each responsibility and inspect exact component guidance.
4. Establish characterization tests before changing behavior.
5. Migrate tokens and providers, then the app shell, then one route or reusable pattern at a time.
6. Keep data, auth, router, and cache logic unchanged unless the migration explicitly includes application architecture.
7. Run `popcandy validate --path . --json` after every slice. Remove private imports and hardcoded design values rather than hiding warnings.
8. Compare interaction, accessibility, responsive, and visual behavior before deleting the legacy implementation.

Read [migration order](references/migration-order.md) before planning commits.
