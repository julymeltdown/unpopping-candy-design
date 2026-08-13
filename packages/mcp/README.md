# @unpopping-candy/mcp

Local Model Context Protocol server for Unpopping Candy. It exposes bounded project information, component and pattern discovery, deterministic composition planning, source validation, and a guarded Registry scaffold action over the same catalog used by the CLI and generated documents.

Requires Node.js 22.13 or later in the Node 22 line, or Node.js 24. The package is not currently published to npm. From a built source checkout, point the client at the local executable with an absolute path:

```json
{
  "mcpServers": {
    "popcandy": {
      "command": "node",
      "args": [
        "/absolute/path/to/unpopping-candy-design/packages/mcp/dist/stdio.js"
      ]
    }
  }
}
```

<!-- POPCANDY_CANDIDATE_MCP_COMMAND -->

The default server uses stdio and performs no network requests. `popcandy_scaffold` is dry-run by default and writes only when `apply: true` is explicitly supplied. Existing different files are never overwritten and target paths may not escape the selected project root.
