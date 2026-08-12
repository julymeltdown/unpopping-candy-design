# Storybook as the executable AI verification surface

## Purpose

Generated source is not accepted solely because it uses valid imports. Storybook provides the browser-facing evidence for component anatomy, states, interactions, accessibility, and theme behavior.

## Contract stories

Every public component has one dedicated catalog story under:

```text
apps/docs/stories/catalog/
```

The stable Story ID is recorded in component metadata and generated into:

```text
agent/manifests/stories.json
```

`npm run stories:check` fails when:

- a public component has no contract story;
- a Story ID differs from metadata;
- a story title is missing or ambiguous;
- generated Story metadata is stale.

## Storybook MCP

The docs app includes the Storybook MCP addon. The configured local endpoint is:

```text
http://localhost:6006/mcp
```

Local configuration is recorded in:

```text
agent/mcp/storybook-http.json
```

Unpopping Candy MCP and Storybook MCP have separate responsibilities:

```text
Unpopping Candy MCP
→ select exact components, patterns, templates, tokens, and rules

Storybook MCP
→ inspect rendered component context, create stories, run browser interactions, and audit accessibility
```

## State completeness

Public component and product-pattern stories should cover applicable states:

```text
default
hover and focus
selected
disabled
pending or loading
empty
error
success
offline
long content
Korean and English
compact and comfortable density
light, dark, and high-contrast themes
reduced motion
mobile viewport
```

Not every primitive needs every state. The adjacent metadata declares the required states for that component.

## Verification commands

With dependencies installed:

```bash
pnpm --filter @unpopping-candy/docs dev
pnpm test:storybook
pnpm --filter @unpopping-candy/docs build-storybook
```

The repository also runs static Story contracts without starting a browser:

```bash
npm run stories:check
```

Static contract success does not prove browser rendering or accessibility success; report them separately.
