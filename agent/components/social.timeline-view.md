# TimelineView

> `social.timeline-view` · `@commonspace/social` · stable · version 0.1.0

Composes timeline states and rendered post rows without owning pagination or virtualization.

## Import

```tsx
import { TimelineView } from '@commonspace/social';
```

```tsx
import { TimelineView } from '@commonspace/social/timeline';
```

## Use when

- An application needs a consistent loading, empty, error, and populated timeline surface.

## Avoid when

- The component would fetch pages itself.
- A static arbitrary list has no social semantics.

## Variants

- **default:** Use the default variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- initial-loading
- populated
- empty
- error
- loading-more

## Accessibility

- Expose the list relationship with semantic list markup.
- Keep existing items when additional loading fails.
- Announce newly accepted items without moving focus.


## Tokens

- `--cs-border`
- `--cs-surface`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `emptyDescription` | `string \| undefined` | No | — |  |
| `emptyTitle` | `string \| undefined` | No | — |  |
| `error` | `string \| null \| undefined` | No | — |  |
| `footer` | `ReactNode \| undefined` | No | — |  |
| `loading` | `boolean \| undefined` | No | — |  |
| `loadingMore` | `boolean \| undefined` | No | — |  |
| `onRetry` | `(() => void) \| undefined` | No | — |  |
| `posts` | `readonly SocialPostViewModel[]` | Yes | — |  |
| `renderPost` | `(post: SocialPostViewModel) => ReactNode` | No | — |  |
| `renderPostActions` | `(post: SocialPostViewModel) => Omit<PostCardProps, 'post'>` | No | — |  |

## Preferred examples

### External pagination

Keeps remote state outside presentation.

```tsx
<TimelineView posts={posts} renderPost={renderPost} loadingMore={isFetchingNextPage} />
```

## Avoid examples

- No avoid example documented.

## Related

- `social.post-card`
- `social.post-card-skeleton`
- `pattern.social-feed`

## Storybook

- `catalog-social-timeline-view--contract`

## Source

- `packages/social/src/timeline/timeline-view.tsx`
