# Commonspace MCP server

## Purpose

`@commonspace/mcp` exposes the exact Commonspace catalog through Model Context Protocol without duplicating the knowledge store. It is designed for local `stdio` use first.

```bash
npm run mcp:dev
```

After publication:

```bash
npx @commonspace/mcp
```

Configuration examples are committed under [`agent/mcp`](../agent/mcp/README.md).

## Architecture

```text
MCP client
   │
   ▼
@commonspace/mcp
   ├─ @commonspace/knowledge
   ├─ @commonspace/cli
   ├─ @commonspace/registry
   └─ @commonspace/tokens
```

The MCP server does not contain component-specific business logic and does not call an LLM.

## Resources

Static resources:

```text
commonspace://design/current
commonspace://catalog
commonspace://tokens
commonspace://registry
commonspace://project/info
```

Dynamic resources:

```text
commonspace://components/{id}
commonspace://patterns/{id}
commonspace://templates/{id}
commonspace://migrations/{id}
```

The server advertises a bounded resource template for each knowledge kind. Reading an unknown stable ID fails.

## Tools

### `commonspace_project_info`

Detects framework, package manager, configuration, installed Commonspace versions, source roots, and style imports.

### `commonspace_search`

Returns bounded, scored component, pattern, template, or migration results.

### `commonspace_get`

Returns one exact structured entry by stable ID.

### `commonspace_compose`

Creates a bounded implementation plan from a product request.

### `commonspace_validate`

Scans the selected project without mutation.

### `commonspace_scaffold`

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

Commonspace MCP answers **what should be used and how it is contracted**. Storybook MCP answers **how the actual component or generated story renders and behaves in a browser**.

Do not duplicate Storybook browser execution inside Commonspace MCP.
