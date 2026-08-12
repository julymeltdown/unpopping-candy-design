# ProfileHeader

> `social.profile-header` · `@unpopping-candy/social` · stable · version 0.1.0

Presents a curator or user profile summary with injected primary and secondary actions.

## Import

```tsx
import { ProfileHeader } from '@unpopping-candy/social';
```

```tsx
import { ProfileHeader } from '@unpopping-candy/social/profile';
```

## Use when

- A profile route needs consistent cover, identity, biography, and counts.

## Avoid when

- A compact list row is sufficient; use UserCell.

## Variants

- **self:** Use the self variant only when its semantic role matches the surrounding decision or content hierarchy.
- **other:** Use the other variant only when its semantic role matches the surrounding decision or content hierarchy.
- **private:** Use the private variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default
- following
- pending
- blocked

## Accessibility

- Heading levels must fit the page hierarchy.
- Counts need complete accessible labels.
- Cover imagery must not hide identity text.


## Tokens

- `--popcandy-surface`
- `--popcandy-border`
- `--popcandy-ink`
- `--popcandy-ink-muted`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `locale` | `string \| undefined` | No | — |  |
| `onOpenFollowers` | `(() => void) \| undefined` | No | — |  |
| `onOpenFollowing` | `(() => void) \| undefined` | No | — |  |
| `primaryAction` | `ReactNode \| undefined` | No | — |  |
| `profile` | `SocialProfileViewModel` | Yes | — |  |

## Preferred examples

### External relationship action

Keeps relationship behavior in the application.

```tsx
<ProfileHeader profile={profile} primaryAction={<FollowButton />} />
```

## Avoid examples

- No avoid example documented.

## Related

- `social.user-cell`
- `pattern.profile-surface`

## Storybook

- `catalog-social-profile-header--contract`

## Source

- `packages/social/src/profile/profile-header.tsx`
