# Separator

> `ui.separator` · `@commonspace/ui` · stable · version 0.1.0

Separates adjacent regions when spacing alone cannot communicate the boundary.

## Import

```tsx
import { Separator } from '@commonspace/ui';
```

```tsx
import { Separator } from '@commonspace/ui/layout';
```

## Use when

- Two peer regions need a visible boundary.

## Avoid when

- The rule is decorative only and adds visual noise.

## Variants

- **horizontal:** Use the horizontal variant only when its semantic role matches the surrounding decision or content hierarchy.
- **vertical:** Use the vertical variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default

## Accessibility

- Use semantic hr behavior for meaningful thematic breaks.
- Hide purely decorative separators from assistive technology.


## Tokens

- `--cs-border`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `orientation` | `'horizontal' \| 'vertical' \| undefined` | No | — |  |

## Preferred examples

### Section boundary

Uses the shared border token.

```tsx
<Separator />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.stack`
- `ui.surface`

## Storybook

- `catalog-ui-separator--contract`

## Source

- `packages/ui/src/separator/separator.tsx`
