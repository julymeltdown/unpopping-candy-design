# @commonspace/mcp

Local Model Context Protocol server for Commonspace UI. It exposes bounded project information, component and pattern discovery, deterministic composition planning, source validation, and a guarded Registry scaffold action over the same catalog used by the CLI and generated documents.

```json
{
  "mcpServers": {
    "commonspace": {
      "command": "npx",
      "args": ["-y", "@commonspace/mcp@0.2.0"]
    }
  }
}
```

The default server uses stdio and performs no network requests. `commonspace_scaffold` is dry-run by default and writes only when `apply: true` is explicitly supplied. Existing different files are never overwritten and target paths may not escape the selected project root.
