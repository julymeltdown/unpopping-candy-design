# ADR 0003: Keep MCP compressed and actions guarded

## Status

Accepted.

## Context

Registering a separate MCP tool for every component creates a large, repetitive tool surface and encourages version drift. Giving an agent unrestricted filesystem write tools also exceeds what a design-system server needs.

## Decision

Expose a small set of general MCP tools:

```text
project_info
search
get
compose
validate
scaffold
```

Expose component, pattern, template, and migration data through resource templates. Keep all retrieval and validation read-only. Allow Registry scaffolding only as a dry-run by default, with explicit apply, root containment, checksum-backed files, conflict rejection, and symlink defense.

## Consequences

- Tool descriptions remain bounded as the catalog grows.
- New components do not require MCP server changes.
- The same catalog and Registry services are tested independently of MCP transport.
- Write access is narrow, reviewable, and deterministic.
