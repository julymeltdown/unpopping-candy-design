# Skeleton

> `ui.skeleton` · `@unpopping-candy/ui` · stable · version 0.1.0

Reserves stable geometry while content is loading.

## Import

```tsx
import { Skeleton } from '@unpopping-candy/ui';
```

```tsx
import { Skeleton } from '@unpopping-candy/ui/loading';
```

## Use when

- The final content shape is predictable and load time is perceptible.

## Avoid when

- The operation is immediate or the layout is unknown; use Spinner or a simple pending label.

## Variants

- **text:** Use the text variant only when its semantic role matches the surrounding decision or content hierarchy.
- **circle:** Use the circle variant only when its semantic role matches the surrounding decision or content hierarchy.
- **block:** Use the block variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- loading

## Accessibility

- Mark the containing region busy.
- Skeleton elements themselves should be hidden from assistive technology.
- Respect reduced motion.


## Tokens

- `--popcandy-surface-muted`
- `--popcandy-motion-slow`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `height` | `CSSProperties['height']` | No | — |  |
| `radius` | `CSSProperties['borderRadius']` | No | — |  |
| `width` | `CSSProperties['width']` | No | — |  |

## Preferred examples

### Timeline row

Reserves layout without announcing fake content.

```tsx
<Skeleton aria-hidden style={{ height: 160 }} />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.spinner`
- `ui.empty-state`

## Storybook

- `catalog-ui-skeleton--contract`

## Source

- `packages/ui/src/skeleton/skeleton.tsx`
