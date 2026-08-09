# UserCell

> `social.user-cell` · `@commonspace/social` · stable · version 0.1.0

Presents a compact person row with optional supporting text and injected action.

## Import

```tsx
import { UserCell } from '@commonspace/social';
```

```tsx
import { UserCell } from '@commonspace/social/user';
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

- `--cs-ink`
- `--cs-ink-muted`
- `--cs-border`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Search result

Separates row navigation and relationship action.

```tsx
<UserCell user={user} onSelect={openProfile} action={<FollowButton />} />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.avatar`
- `social.profile-header`

## Storybook

- `catalog-social--user-cell`

## Source

- `packages/social/src/user-cell/user-cell.tsx`
