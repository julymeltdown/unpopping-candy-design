# PostActions

> `social.post-actions` · `@unpopping-candy/social` · stable · version 0.1.0

Presents reply, repost, like, bookmark, and share actions as controlled social interactions.

## Import

```tsx
import { PostActions } from '@unpopping-candy/social';
```

```tsx
import { PostActions } from '@unpopping-candy/social/post';
```

## Use when

- A post exposes standard engagement actions.

## Avoid when

- A product has different action semantics; compose explicit Buttons instead.

## Variants

- **default:** Use the default variant only when its semantic role matches the surrounding decision or content hierarchy.
- **compact:** Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- idle
- liked
- reposted
- bookmarked
- pending

## Accessibility

- Each icon action needs an accessible label and pressed state.
- Pending state must prevent duplicate mutation without erasing current state.


## Tokens

- `--popcandy-ink-muted`
- `--popcandy-accent`
- `--popcandy-positive`
- `--popcandy-critical`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `disabled` | `boolean \| undefined` | No | — |  |
| `locale` | `string \| undefined` | No | — |  |
| `metrics` | `SocialPostMetrics` | Yes | — |  |
| `onBookmark` | `(() => void) \| undefined` | No | — |  |
| `onLike` | `(() => void) \| undefined` | No | — |  |
| `onReply` | `(() => void) \| undefined` | No | — |  |
| `onRepost` | `(() => void) \| undefined` | No | — |  |
| `onShare` | `(() => void) \| undefined` | No | — |  |
| `pendingAction` | `'like' \| 'bookmark' \| 'repost' \| null \| undefined` | No | — |  |
| `viewerState` | `SocialPostViewerState` | Yes | — |  |

## Preferred examples

### Injected actions

Keeps mutation ownership outside the component.

```tsx
<PostActions metrics={post.metrics} viewerState={post.viewerState} onLike={onLike} pendingAction={pending} />
```

## Avoid examples

- No avoid example documented.

## Related

- `social.post-card`
- `ui.icon-button`

## Storybook

- `catalog-social-post-actions--contract`

## Source

- `packages/social/src/post-card/post-actions.tsx`
