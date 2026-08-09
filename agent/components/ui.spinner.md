# Spinner

> `ui.spinner` · `@commonspace/ui` · stable · version 0.1.0

Indicates an indeterminate operation in a compact region.

## Import

```tsx
import { Spinner } from '@commonspace/ui';
```

```tsx
import { Spinner } from '@commonspace/ui/loading';
```

## Use when

- A control or small region is waiting and final geometry is unknown.

## Avoid when

- A full content layout can be represented with Skeleton.
- Progress is measurable; use a determinate progress indicator.

## Variants

- **sm:** Use the sm variant only when its semantic role matches the surrounding decision or content hierarchy.
- **md:** Use the md variant only when its semantic role matches the surrounding decision or content hierarchy.
- **lg:** Use the lg variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- active

## Accessibility

- Provide a visible or visually hidden loading label.
- Respect reduced motion without removing the state indication.


## Tokens

- `--cs-accent`
- `--cs-motion-fast`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Pending control

Announces the current operation.

```tsx
<Spinner label="Saving changes" />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.skeleton`
- `ui.button`

## Storybook

- `catalog-ui-spinner--contract`

## Source

- `packages/ui/src/spinner/spinner.tsx`
