# Stack

> `ui.stack` · `@unpopping-candy/ui` · stable · version 0.1.0

Arranges a vertical reading or task sequence with tokenized spacing.

## Import

```tsx
import { Stack } from '@unpopping-candy/ui';
```

```tsx
import { Stack } from '@unpopping-candy/ui/layout';
```

## Use when

- Content forms a vertical hierarchy or workflow.

## Avoid when

- Items form a compact horizontal group; use Inline.

## Variants

- **xs:** Use the xs variant only when its semantic role matches the surrounding decision or content hierarchy.
- **sm:** Use the sm variant only when its semantic role matches the surrounding decision or content hierarchy.
- **md:** Use the md variant only when its semantic role matches the surrounding decision or content hierarchy.
- **lg:** Use the lg variant only when its semantic role matches the surrounding decision or content hierarchy.
- **xl:** Use the xl variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default

## Accessibility

- Do not change semantic order for visual layout.
- Use responsive gaps rather than arbitrary child margins.


## Tokens

- `--popcandy-space-1`
- `--popcandy-space-2`
- `--popcandy-space-3`
- `--popcandy-space-4`
- `--popcandy-space-6`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `align` | `CSSProperties['alignItems']` | No | — |  |
| `gap` | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 8 \| 10 \| 12 \| 16 \| undefined` | No | — |  |

## Preferred examples

### Form layout

Creates consistent vertical rhythm.

```tsx
<Stack gap={4}><TextField label="Name" /><TextArea label="Biography" /></Stack>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.inline`
- `ui.container`

## Storybook

- `catalog-ui-stack--contract`

## Source

- `packages/ui/src/stack/stack.tsx`
