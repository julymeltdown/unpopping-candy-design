# Static preview

`index.html` is a dependency-free documentation fixture that uses the design system's actual token, UI, icon-wrapper, and social CSS sources. It exists to provide a stable visual artifact even when the React/Storybook dependency graph is unavailable.

The committed capture was rendered at:

```text
viewport      1440 × 1000
pixel ratio   1
browser       system Chromium
console error 0
page error    0
horizontal overflow 0
```

The fixture is not a substitute for Storybook browser tests or the built-package consumer application. It does not execute React components.

Recreate the capture with:

```bash
pnpm preview:capture
```

Set `CHROMIUM_PATH` when Chromium is installed elsewhere.
