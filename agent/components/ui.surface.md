# Surface

> `ui.surface` · `@commonspace/ui` · stable · version 0.1.0

Creates a semantic background and boundary without prescribing product content.

## Import

```tsx
import { Surface } from '@commonspace/ui';
```

```tsx
import { Surface } from '@commonspace/ui/layout';
```

## Use when

- A local region needs contrast, padding, or elevation.

## Avoid when

- Every item in a feed would become a nested card.
- Whitespace and a divider communicate the boundary better.

## Variants

- **plain:** Use the plain variant only when its semantic role matches the surrounding decision or content hierarchy.
- **subtle:** Use the subtle variant only when its semantic role matches the surrounding decision or content hierarchy.
- **raised:** Use the raised variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default
- interactive

## Accessibility

- Interactive surfaces must use a semantic interactive element.
- Do not rely on elevation alone for grouping.


## Tokens

- `--cs-surface`
- `--cs-surface-muted`
- `--cs-border`
- `--cs-shadow-dialog`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Settings section

Adds bounded contrast to a local region.

```tsx
<Surface tone="subtle"><Stack>...</Stack></Surface>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.container`
- `ui.separator`

## Storybook

- `catalog-ui--surface`

## Source

- `packages/ui/src/surface/surface.tsx`
