# ADR 0002: Use one canonical structured knowledge source

## Status

Accepted.

## Context

Maintaining separate hand-written component inventories for documentation, CLI, MCP, Skills, `DESIGN.md`, Registry, evaluations, and Figma would cause version drift and contradictory advice.

TypeScript alone can expose names and types but cannot reliably explain product intent, composition, anti-patterns, state completeness, or accessibility expectations.

## Decision

Use component-adjacent typed metadata plus public TypeScript source, tokens, product-pattern metadata, templates, migrations, and Storybook contract IDs as the canonical knowledge graph.

A deterministic compiler generates all portable documents and manifests. CLI and MCP query the same in-memory catalog. Skills describe workflow only and retrieve exact component data at task time.

## Consequences

- Human guidance is written once beside the source it describes.
- Public prop contracts are compiler-derived rather than duplicated.
- Generated files are checked for staleness in CI.
- An integration that cannot consume the catalog directly must consume a generated manifest, not create its own inventory.
- Adding a public component requires metadata and a Story contract.
