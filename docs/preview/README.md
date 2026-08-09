# Static preview

`index.html` is a dependency-free documentation fixture using the design system's actual token, UI, icon-wrapper, and social CSS sources. It presents both the package surface and the AI-operable knowledge plane so a stable visual artifact remains available even when the React and Storybook dependency graph cannot be installed.

The committed capture was rendered at:

```text
viewport             1440 × 1000
pixel ratio          1
browser              system Chromium
broken images        0
console/page errors  0
horizontal overflow  0
```

The preview illustrates:

- general UI and social composition;
- actual Unpopping Candy package CSS;
- canonical component, pattern, template, and Story counts;
- the detect → search/compose → implement/story → validate workflow;
- the compressed MCP and dry-run Registry model.

The fixture is not a substitute for:

- React rendering;
- Storybook browser tests;
- interaction tests;
- accessibility tooling;
- the built-package consumer fixture;
- a real MCP client session;
- Figma Code Connect publication.

Recreate the capture with:

```bash
npm run preview:capture
```

Set `CHROMIUM_PATH` when Chromium is installed elsewhere.
