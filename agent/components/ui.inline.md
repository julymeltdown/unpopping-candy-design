# Inline

> `ui.inline` · `@commonspace/ui` · stable · version 0.1.0

Arranges related items horizontally with tokenized gap, alignment, and wrapping.

## Import

```tsx
import { Inline } from '@commonspace/ui';
```

```tsx
import { Inline } from '@commonspace/ui/layout';
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

- `--cs-space-1`
- `--cs-space-2`
- `--cs-space-3`
- `--cs-space-4`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Action row

Groups related actions without arbitrary margins.

```tsx
<Inline gap="sm"><Button>Save</Button><Button variant="secondary">Cancel</Button></Inline>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.stack`
- `ui.separator`

## Storybook

- `catalog-ui--inline`

## Source

- `packages/ui/src/inline/inline.tsx`
