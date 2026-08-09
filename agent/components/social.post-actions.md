# PostActions

> `social.post-actions` · `@commonspace/social` · stable · version 0.1.0

Presents reply, repost, like, bookmark, and share actions as controlled social interactions.

## Import

```tsx
import { PostActions } from '@commonspace/social';
```

```tsx
import { PostActions } from '@commonspace/social/post';
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

- `--cs-ink-muted`
- `--cs-accent`
- `--cs-positive`
- `--cs-critical`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Injected actions

Keeps mutation ownership outside the component.

```tsx
<PostActions post={post} onLike={onLike} pendingAction={pending} />
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
