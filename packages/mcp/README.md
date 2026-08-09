# @commonspace/mcp

Local, read-only Model Context Protocol server for Commonspace UI. It exposes bounded project information, component and pattern discovery, deterministic composition planning, and source validation over the same catalog used by the CLI and generated documents.

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

The default server uses stdio, performs no network requests, and provides no file-mutation tools. Registry writes are a separate, explicit, dry-run-first capability.
