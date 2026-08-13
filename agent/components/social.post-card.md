# PostCard

> `social.post-card` · `@unpopping-candy/social` · stable · version 0.1.0

Presents a social post with author, content, distribution context, metrics, and injected actions.

## Import

```tsx
import { PostCard } from '@unpopping-candy/social';
```

```tsx
import { PostCard } from '@unpopping-candy/social/post';
```

## Use when

- A timeline or thread needs a complete post presentation.

## Avoid when

- The application needs to fetch or mutate post data inside the component.
- A compact reference is sufficient; use a post summary pattern.

## Variants

- **timeline:** Use the timeline variant only when its semantic role matches the surrounding decision or content hierarchy.
- **detail:** Use the detail variant only when its semantic role matches the surrounding decision or content hierarchy.
- **quoted:** Use the quoted variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default
- selected
- pending-action
- deleted

## Accessibility

- The outer interactive region must not swallow nested action focus.
- Media requires alternative text.
- Metrics must have accessible labels, not numbers alone.


## Tokens

- `--popcandy-surface`
- `--popcandy-border`
- `--popcandy-ink`
- `--popcandy-accent`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `compact` | `boolean \| undefined` | No | — |  |
| `locale` | `string \| undefined` | No | — |  |
| `nowMs` | `number \| undefined` | No | — |  |
| `onBookmark` | `(() => void) \| undefined` | No | — |  |
| `onLike` | `(() => void) \| undefined` | No | — |  |
| `onOpenAuthor` | `(() => void) \| undefined` | No | — |  |
| `onOpenMedia` | `((mediaId: string) => void) \| undefined` | No | — |  |
| `onOpenMenu` | `(() => void) \| undefined` | No | — |  |
| `onOpenPost` | `(() => void) \| undefined` | No | — |  |
| `onOpenQuotedPost` | `(() => void) \| undefined` | No | — |  |
| `onReply` | `(() => void) \| undefined` | No | — |  |
| `onRepost` | `(() => void) \| undefined` | No | — |  |
| `onShare` | `(() => void) \| undefined` | No | — |  |
| `pendingAction` | `'like' \| 'bookmark' \| 'repost' \| null \| undefined` | No | — |  |
| `post` | `SocialPostViewModel` | Yes | — |  |

## Preferred examples

### Controlled post

Keeps network and routing concerns in the consuming application.

```tsx
<PostCard post={post} onLike={() => onLike(post.id)} onOpenPost={() => open(post.id)} />
```

## Avoid examples

### Fetching inside

Couples presentation to one data layer and prevents isolated use.

```tsx
function PostCard({ id }) { const post = useQuery(...); }
```

## Related

- `social.post-header`
- `social.post-actions`
- `social.post-media-grid`
- `pattern.social-feed`

## Storybook

- `catalog-social-postcard--contract`

## Source

- `packages/social/src/post-card/post-card.tsx`
