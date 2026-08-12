# Inline

> `ui.inline` · `@unpopping-candy/ui` · stable · version 0.1.0

Arranges related items horizontally with tokenized gap, alignment, and wrapping.

## Import

```tsx
import { Inline } from '@unpopping-candy/ui';
```

```tsx
import { Inline } from '@unpopping-candy/ui/layout';
```

## Use when

- Actions, metadata, or compact controls form one horizontal group.

## Avoid when

- Items represent a vertical reading sequence; use Stack.

## Variants

- **start:** Use the start variant only when its semantic role matches the surrounding decision or content hierarchy.
- **center:** Use the center variant only when its semantic role matches the surrounding decision or content hierarchy.
- **end:** Use the end variant only when its semantic role matches the surrounding decision or content hierarchy.
- **space-between:** Use the space-between variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- nowrap
- wrap

## Accessibility

- Allow wrapping when labels may grow or localize.
- Preserve a logical DOM order.


## Tokens

- `--popcandy-space-1`
- `--popcandy-space-2`
- `--popcandy-space-3`
- `--popcandy-space-4`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `align` | `CSSProperties['alignItems']` | No | — |  |
| `gap` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 10 \| 12 \| 16 \| undefined` | No | — |  |
| `justify` | `CSSProperties['justifyContent']` | No | — |  |
| `wrap` | `boolean \| undefined` | No | — |  |

## Preferred examples

### Action row

Groups related actions without arbitrary margins.

```tsx
<Inline gap={3}><Button>Save</Button><Button variant="secondary">Cancel</Button></Inline>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.stack`
- `ui.separator`

## Storybook

- `catalog-ui-inline--contract`

## Source

- `packages/ui/src/inline/inline.tsx`
