# PostCardSkeleton

> `social.post-card-skeleton` · `@commonspace/social` · stable · version 0.1.0

Reserves the expected geometry of a PostCard while timeline data loads.

## Import

```tsx
import { PostCardSkeleton } from '@commonspace/social';
```

```tsx
import { PostCardSkeleton } from '@commonspace/social/post';
```

## Use when

- A timeline is loading its first page.

## Avoid when

- Existing posts are available and only another page is loading.

## Variants

- **default:** Use the default variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- loading

## Accessibility

- Mark the containing timeline region busy.
- Do not expose placeholder text as content.


## Tokens

- `--cs-surface-muted`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Initial timeline

Matches the post layout without fake content.

```tsx
<PostCardSkeleton />
```

## Avoid examples

- No avoid example documented.

## Related

- `social.post-card`
- `ui.skeleton`

## Storybook

- `catalog-social-post-card-skeleton--contract`

## Source

- `packages/social/src/post-card/post-card-skeleton.tsx`
