# @unpopping-candy/mcp

Local Model Context Protocol server for Unpopping Candy. It exposes bounded project information, component and pattern discovery, deterministic composition planning, source validation, and a guarded Registry scaffold action over the same catalog used by the CLI and generated documents.

Requires Node.js 22.13 or later in the Node 22 line, or Node.js 24.

```json
{
  "mcpServers": {
    "popcandy": {
      "command": "npx",
      "args": ["-y", "@unpopping-candy/mcp@0.2.0"]
    }
  }
}
```

The default server uses stdio and performs no network requests. `popcandy_scaffold` is dry-run by default and writes only when `apply: true` is explicitly supplied. Existing different files are never overwritten and target paths may not escape the selected project root.
