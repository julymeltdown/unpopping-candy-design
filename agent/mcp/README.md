# Commonspace MCP configuration

`@commonspace/mcp` is a local stdio server. It exposes read-only resources, five generic tools, and four workflow prompts. It does not call an LLM, fetch remote URLs, or modify files.

## Tool surface

```text
commonspace_project_info
commonspace_search
commonspace_get
commonspace_compose
commonspace_validate
```

The small generic surface prevents component-per-tool context bloat. Component, pattern, template, and migration detail is passed as an input to `commonspace_get` or read as a resource.

## Local source checkout

```bash
node --experimental-strip-types packages/mcp/src/stdio.ts
```

## Published package

```bash
npx -y @commonspace/mcp@0.2.0
```

The example client configurations in this directory are templates. Pin the version and adjust the repository path before use.
