# Unpopping Candy Storybook agent contract

When implementing or reviewing Unpopping Candy:

1. Use the Unpopping Candy catalog MCP or CLI to select exact components, patterns, and tokens before writing code.
2. Use the Storybook MCP endpoint at `http://localhost:6006/mcp` to inspect the live component manifest and example stories.
3. Never invent props. Query component documentation or its contract story first.
4. Add or update stories for loading, empty, error, disabled, pending, long-content, mobile, dark, and high-contrast states relevant to the change.
5. Run Storybook interaction and accessibility checks with the `run-story-tests` tool.
6. Run `npm run stories:check` and `npm run verify` before completion.

The generated catalog-to-story mapping is `agent/manifests/stories.json`. Each stable component must resolve to a committed Storybook story with `meta.component`.
