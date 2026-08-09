# Unpopping Candy AI-Native Design System Implementation Plan

**Goal:** Upgrade Unpopping Candy into an AI-operable design system with one canonical knowledge source, generated agent documents, deterministic CLI, Agent Skills, MCP, Registry, Storybook integration, agent evaluations, and Figma Code Connect scaffolding.

**Architecture:** Component, pattern, template, token, story, and migration metadata are validated once and compiled into versioned manifests. CLI, MCP, Skills, Registry, Storybook, Figma, and portable documents consume those artifacts; none maintains a separate component truth.

**Constraints:**

- Preserve existing `@unpopping-candy/*` visual package APIs.
- Keep visual packages free of filesystem, CLI, MCP, agent, registry, and Node-only dependencies.
- Generated output must be deterministic and fail CI when stale.
- MCP mutation requires project-root confinement, dry-run output, an explicit apply flag, and allowlisted registry entries.
- Skills follow the Agent Skills specification.
- Storybook remains the executable visual truth.
- Figma files use placeholders until real component URLs are supplied.
- Add tests and a clean commit for every work package.

## Work packages

1. Canonical structured knowledge and compiler.
2. Generated `DESIGN.md`, `llms*.txt`, component and pattern documentation.
3. Deterministic offline CLI: info, list, get, search, compose, validate, doctor, scaffold.
4. Portable Agent Skills for use, build, migrate, review, and component authoring.
5. Read-only stdio MCP resources, tools, and prompts over the same domain services.
6. Versioned Registry with sandboxed dry-run/apply actions.
7. Storybook MCP and manifest/story consistency gates.
8. Agent evaluation harness and release thresholds.
9. Figma Code Connect template generation and mapping validation.
10. Governance, CI, documentation, merge, tag, and distributable archives.

## Acceptance criteria

- Every stable public component has metadata, an import path, accessibility guidance, and at least one Storybook story reference.
- CLI and MCP return structured, bounded, version-aware results.
- Skills invoke project detection and component search before code generation.
- Registry writes cannot escape the selected project root.
- Agent evaluation detects invalid imports, hallucinated props, hardcoded visual values, missing states, and low Unpopping Candy reuse.
- All generated files reproduce byte-for-byte.
- Existing package tests and architecture checks remain green.
