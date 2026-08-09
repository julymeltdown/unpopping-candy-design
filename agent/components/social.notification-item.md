# NotificationItem

> `social.notification-item` · `@commonspace/social` · stable · version 0.1.0

Presents one social notification with actor context, event description, and optional target content.

## Import

```tsx
import { NotificationItem } from '@commonspace/social';
```

```tsx
import { NotificationItem } from '@commonspace/social/notification';
```

## Use when

- A notification center renders typed social activity.

## Avoid when

- A global application Toast is needed.

## Variants

- **like:** Use the like variant only when its semantic role matches the surrounding decision or content hierarchy.
- **reply:** Use the reply variant only when its semantic role matches the surrounding decision or content hierarchy.
- **repost:** Use the repost variant only when its semantic role matches the surrounding decision or content hierarchy.
- **follow:** Use the follow variant only when its semantic role matches the surrounding decision or content hierarchy.
- **system:** Use the system variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- unread
- read
- selected

## Accessibility

- Unread state must be communicated beyond color.
- Event text should make sense without relying on iconography.
- The row needs one predictable activation target.


## Tokens

- `--cs-surface`
- `--cs-border`
- `--cs-ink-muted`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Notification list

Keeps routing outside the package.

```tsx
<NotificationItem notification={item} onSelect={openTarget} />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.toast`
- `pattern.collection-states`

## Storybook

- `catalog-social-notification-item--contract`

## Source

- `packages/social/src/notification/notification-item.tsx`
