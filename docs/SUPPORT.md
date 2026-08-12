# Support policy

Unpopping Candy follows pre-1.0 current-minor support.

## Supported release window

Before `1.0.0`, once publication begins, only the newest published `0.N.x` minor line receives fixes and compatibility updates. Patch releases may correct defects without intentionally changing the documented public API. Moving from `0.N` to `0.N+1` may include breaking changes and requires migration and release notes.

Older minor lines are unsupported once a newer minor is published. Maintainers may answer questions or accept a narrowly scoped backport, but that is best effort and not a support commitment.

Because the public packages are not yet published to npm, there is currently no supported published minor. Stage 0 source and local tarballs are evaluation artifacts rather than a supported npm release.

## Getting help

Use [GitHub issues](https://github.com/julymeltdown/unpopping-candy-design/issues) for reproducible bugs, accessibility problems that are safe to disclose, documentation gaps, and feature proposals. Include the full package versions, catalog version, framework/React/manager versions, minimal reproduction, expected and actual behavior, and verification commands.

Do not post credentials, private content, personal data, or suspected vulnerabilities in a public issue. Use [GitHub private vulnerability reporting](./SECURITY.md) for security reports.

## Scope

Support covers documented public package entrypoints, semantic tokens, stable catalog IDs, committed Registry templates, and the compatibility cells backed by executed evidence. It does not cover package internals, invented props, generated-file edits, application business logic, remote Registry access, hosted MCP, placeholder Figma mappings, or unexecuted roadmap components.

See [compatibility](./COMPATIBILITY.md), [accessibility](./ACCESSIBILITY.md), and [versioning](./VERSIONING.md) for the boundaries attached to a release.
