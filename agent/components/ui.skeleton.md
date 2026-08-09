# Skeleton

> `ui.skeleton` · `@commonspace/ui` · stable · version 0.1.0

Reserves stable geometry while content is loading.

## Import

```tsx
import { Skeleton } from '@commonspace/ui';
```

```tsx
import { Skeleton } from '@commonspace/ui/loading';
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

- `--cs-surface-muted`
- `--cs-motion-slow`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

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
