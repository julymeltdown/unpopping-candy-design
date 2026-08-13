# Unpopping Candy MCP server

## Purpose

`@unpopping-candy/mcp` exposes the exact Unpopping Candy catalog through Model Context Protocol without duplicating the knowledge store. It is designed for local `stdio` use first.

```bash
npm run mcp:dev
```

The package is not currently published to npm, so there is no valid npm or `npx` invocation yet. After an approved release, copy the immutable, exact-version client command from that release's verified artifact rather than using a floating package reference.

Configuration examples are committed under [`agent/mcp`](../agent/mcp/README.md).

## Architecture

```text
MCP client
   │
   ▼
@unpopping-candy/mcp
   ├─ @unpopping-candy/knowledge
   ├─ @unpopping-candy/cli
   ├─ @unpopping-candy/registry
   └─ @unpopping-candy/tokens
```

The MCP server does not contain component-specific business logic and does not call an LLM.

## Resources

Static resources:

```text
popcandy://design/current
popcandy://catalog
popcandy://tokens
popcandy://registry
popcandy://project/info
```

Dynamic resources:

```text
popcandy://components/{id}
popcandy://patterns/{id}
popcandy://templates/{id}
popcandy://migrations/{id}
```

The server advertises a bounded resource template for each knowledge kind. Reading an unknown stable ID fails.

## Tools

### `popcandy_project_info`

Detects framework, package manager, configuration, installed Unpopping Candy versions, source roots, and style imports.

### `popcandy_search`

Returns bounded, scored component, pattern, template, or migration results.

### `popcandy_get`

Returns one exact structured entry by stable ID.

### `popcandy_compose`

Creates a bounded implementation plan from a product request.

### `popcandy_validate`

Scans the selected project without mutation.

### `popcandy_scaffold`

Returns a dry-run template plan by default. `apply: true` is required to write.

The MCP intentionally uses a small general tool set instead of registering one tool for every component.

## Prompts

User-selectable prompts:

```text
build-interface
migrate-interface
review-interface
author-component
```

Each prompt encodes the mandatory sequence:

```text
project info
→ search and compose
→ inspect exact entries
→ public imports and consumer-owned state
→ Storybook stories
→ validation and accessibility checks
```

## Structured results

Tools return both text and structured content. Consumers should prefer structured content when supported and avoid scraping prose.

## Mutation security

The only write-capable operation is Registry scaffolding. It is:

- dry-run by default;
- explicit on apply;
- root-contained;
- conflict-safe;
- symlink-aware;
- checksum-backed;
- free from arbitrary network fetching.

Run the MCP with the minimum filesystem permissions appropriate to the selected project.

## Storybook MCP relationship

Unpopping Candy MCP answers **what should be used and how it is contracted**. Storybook MCP answers **how the actual component or generated story renders and behaves in a browser**.

Do not duplicate Storybook browser execution inside Unpopping Candy MCP.
