# Stack

> `ui.stack` · `@commonspace/ui` · stable · version 0.1.0

Arranges a vertical reading or task sequence with tokenized spacing.

## Import

```tsx
import { Stack } from '@commonspace/ui';
```

```tsx
import { Stack } from '@commonspace/ui/layout';
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

- `--cs-space-1`
- `--cs-space-2`
- `--cs-space-3`
- `--cs-space-4`
- `--cs-space-6`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Form layout

Creates consistent vertical rhythm.

```tsx
<Stack gap="md"><TextField /><TextArea /></Stack>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.inline`
- `ui.container`

## Storybook

- `catalog-ui--stack`

## Source

- `packages/ui/src/stack/stack.tsx`
