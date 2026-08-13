# UserCell

> `social.user-cell` · `@unpopping-candy/social` · stable · version 0.1.0

Presents a compact person row with optional supporting text and injected action.

## Import

```tsx
import { UserCell } from '@unpopping-candy/social';
```

```tsx
import { UserCell } from '@unpopping-candy/social/user';
```

## Use when

- Search, followers, recommendations, or membership lists show people.

## Avoid when

- A full profile context is needed; use ProfileHeader.

## Variants

- **default:** Use the default variant only when its semantic role matches the surrounding decision or content hierarchy.
- **compact:** Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default
- selected
- pending

## Accessibility

- If the entire row is interactive, preserve nested action behavior.
- Identity text must not be conveyed by avatar alone.


## Tokens

- `--popcandy-ink`
- `--popcandy-ink-muted`
- `--popcandy-border`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `actionLabel` | `string \| undefined` | No | — |  |
| `actionPending` | `boolean \| undefined` | No | — |  |
| `description` | `ReactNode \| undefined` | No | — |  |
| `onAction` | `(() => void) \| undefined` | No | — |  |
| `onSelect` | `(() => void) \| undefined` | No | — |  |
| `user` | `SocialUserViewModel` | Yes | — |  |

## Preferred examples

### Search result

Separates row navigation and relationship action.

```tsx
<UserCell user={user} onSelect={openProfile} actionLabel="Follow" onAction={followUser} />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.avatar`
- `social.profile-header`

## Storybook

- `catalog-social-usercell--contract`

## Source

- `packages/social/src/user-cell/user-cell.tsx`
