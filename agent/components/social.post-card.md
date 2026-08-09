# PostCard

> `social.post-card` · `@commonspace/social` · stable · version 0.1.0

Presents a social post with author, content, distribution context, metrics, and injected actions.

## Import

```tsx
import { PostCard } from '@commonspace/social';
```

```tsx
import { PostCard } from '@commonspace/social/post';
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

- `--cs-surface`
- `--cs-border`
- `--cs-ink`
- `--cs-accent`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

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

- `catalog-social-post-card--contract`

## Source

- `packages/social/src/post-card/post-card.tsx`
