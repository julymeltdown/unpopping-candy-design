# Container

> `ui.container` · `@commonspace/ui` · stable · version 0.1.0

Constrains page content to a readable width and consistent horizontal gutter.

## Import

```tsx
import { Container } from '@commonspace/ui';
```

```tsx
import { Container } from '@commonspace/ui/layout';
```

## Use when

- A page or section needs the standard Commonspace reading width.

## Avoid when

- The element must be full bleed.
- A local group only needs spacing; use Stack or Inline.

## Variants

- **sm:** Use the sm variant only when its semantic role matches the surrounding decision or content hierarchy.
- **md:** Use the md variant only when its semantic role matches the surrounding decision or content hierarchy.
- **lg:** Use the lg variant only when its semantic role matches the surrounding decision or content hierarchy.
- **full:** Use the full variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default

## Accessibility

- Container must not prevent 320px reflow.
- Landmark semantics belong to the element passed through asChild or wrapping structure.


## Tokens

- `--cs-space-4`
- `--cs-space-6`
- `--cs-shell-max`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `size` | `'sm' \| 'md' \| 'lg' \| 'full' \| undefined` | No | — |  |

## Preferred examples

### Page shell

Uses standard gutters and width.

```tsx
<Container size="lg"><main>{children}</main></Container>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.stack`
- `ui.inline`

## Storybook

- `catalog-ui-container--contract`

## Source

- `packages/ui/src/container/container.tsx`
