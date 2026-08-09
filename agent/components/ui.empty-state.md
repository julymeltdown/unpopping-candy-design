# EmptyState

> `ui.empty-state` · `@commonspace/ui` · stable · version 0.1.0

Explains why a meaningful region has no content and offers the next valid action.

## Import

```tsx
import { EmptyState } from '@commonspace/ui';
```

## Use when

- A list, search, or workspace has no content.

## Avoid when

- Data is still loading; use Skeleton.
- The region failed to load; use Alert.

## Variants

- **compact:** Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy.
- **default:** Use the default variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- first-use
- no-results
- cleared

## Accessibility

- Use a heading that identifies the empty condition.
- Do not imply failure when the empty state is valid.


## Tokens

- `--cs-ink`
- `--cs-ink-muted`
- `--cs-space-8`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### No results

Explains the condition and recovery.

```tsx
<EmptyState title="No matching curators" description="Try a broader search." />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.alert`
- `ui.skeleton`

## Storybook

- `catalog-ui-empty-state--contract`

## Source

- `packages/ui/src/empty-state/empty-state.tsx`
