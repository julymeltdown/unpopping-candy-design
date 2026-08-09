# PostHeader

> `social.post-header` · `@commonspace/social` · stable · version 0.1.0

Presents post identity, timestamp, and distribution context without owning navigation.

## Import

```tsx
import { PostHeader } from '@commonspace/social';
```

```tsx
import { PostHeader } from '@commonspace/social/post';
```

## Use when

- A post or compact content item needs consistent identity metadata.

## Avoid when

- A generic person row is needed; use UserCell.

## Variants

- **default:** Use the default variant only when its semantic role matches the surrounding decision or content hierarchy.
- **repost-context:** Use the repost-context variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default
- verified

## Accessibility

- Timestamp text should expose a meaningful date to assistive technology.
- Author navigation is supplied as a callback or link wrapper by the application.


## Tokens

- `--cs-ink`
- `--cs-ink-muted`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `author` | `SocialUserViewModel` | Yes | — |  |
| `createdAt` | `string` | Yes | — |  |
| `locale` | `string \| undefined` | No | — |  |
| `nowMs` | `number \| undefined` | No | — |  |
| `onOpenAuthor` | `(() => void) \| undefined` | No | — |  |
| `onOpenMenu` | `(() => void) \| undefined` | No | — |  |

## Preferred examples

### Post identity

Injects navigation behavior.

```tsx
<PostHeader post={post} onOpenAuthor={openAuthor} />
```

## Avoid examples

- No avoid example documented.

## Related

- `social.post-card`
- `social.user-cell`

## Storybook

- `catalog-social-post-header--contract`

## Source

- `packages/social/src/post-card/post-header.tsx`
