# Unpopping Candy MCP configuration

`@unpopping-candy/mcp` is a local stdio server. It exposes versioned resources, six generic tools, and four workflow prompts. It does not call an LLM or fetch remote URLs.

## Tool surface

```text
popcandy_project_info
popcandy_search
popcandy_get
popcandy_compose
popcandy_validate
popcandy_scaffold
```

The small generic surface prevents component-per-tool context bloat. Component, pattern, template, and migration detail is passed as an input to `popcandy_get` or read as a resource.

`popcandy_scaffold` returns a dry-run plan unless `apply: true` is explicit. It rejects path traversal, absolute targets, symlink escapes, unknown variables, and conflicting files.

## Local source checkout

```bash
pnpm build:packages
node packages/mcp/dist/stdio.js
```

The package is not currently published to npm, so this repository does not advertise an `npx` command. The example client configurations in this directory are source-checkout templates. Replace the absolute repository path before use. An approved release candidate rewrites the packaged MCP README to its exact requested version and is independently verified before publication.
