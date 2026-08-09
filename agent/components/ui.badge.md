# Badge

> `ui.badge` · `@commonspace/ui` · stable · version 0.1.0

Displays a compact status or categorical label without becoming the primary action.

## Import

```tsx
import { Badge } from '@commonspace/ui';
```

```tsx
import { Badge } from '@commonspace/ui/badge';
```

## Use when

- A short status, category, or count needs compact emphasis.

## Avoid when

- The label is interactive; use Button, Tabs, or a link.
- The text is ordinary metadata and does not need a container.

## Variants

- **neutral:** Use the neutral variant only when its semantic role matches the surrounding decision or content hierarchy.
- **accent:** Use the accent variant only when its semantic role matches the surrounding decision or content hierarchy.
- **positive:** Use the positive variant only when its semantic role matches the surrounding decision or content hierarchy.
- **warning:** Use the warning variant only when its semantic role matches the surrounding decision or content hierarchy.
- **critical:** Use the critical variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default

## Accessibility

- Do not communicate state by color alone.
- Keep labels concise enough to remain readable at 200% zoom.


## Tokens

- `--cs-surface-muted`
- `--cs-border`
- `--cs-ink-muted`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Status

Pairs text with semantic color.

```tsx
<Badge tone="positive">Published</Badge>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.alert`

## Storybook

- `catalog-ui-badge--contract`

## Source

- `packages/ui/src/badge/badge.tsx`
