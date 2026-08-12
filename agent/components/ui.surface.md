# Surface

> `ui.surface` · `@unpopping-candy/ui` · stable · version 0.1.0

Creates a semantic background and boundary without prescribing product content.

## Import

```tsx
import { Surface } from '@unpopping-candy/ui';
```

```tsx
import { Surface } from '@unpopping-candy/ui/layout';
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

- `--popcandy-surface`
- `--popcandy-surface-muted`
- `--popcandy-border`
- `--popcandy-shadow-dialog`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `border` | `boolean \| undefined` | No | — |  |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg' \| undefined` | No | — |  |
| `tone` | `'base' \| 'muted' \| 'raised' \| undefined` | No | — |  |

## Preferred examples

### Settings section

Adds bounded contrast to a local region.

```tsx
<Surface tone="muted"><Stack>...</Stack></Surface>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.container`
- `ui.separator`

## Storybook

- `catalog-ui-surface--contract`

## Source

- `packages/ui/src/surface/surface.tsx`
