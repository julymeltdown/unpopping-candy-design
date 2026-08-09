# ProfileHeader

> `social.profile-header` · `@commonspace/social` · stable · version 0.1.0

Presents a curator or user profile summary with injected primary and secondary actions.

## Import

```tsx
import { ProfileHeader } from '@commonspace/social';
```

```tsx
import { ProfileHeader } from '@commonspace/social/profile';
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

- `--cs-surface`
- `--cs-border`
- `--cs-ink`
- `--cs-ink-muted`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### External relationship action

Keeps relationship behavior in the application.

```tsx
<ProfileHeader profile={profile} action={<FollowButton />} />
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
