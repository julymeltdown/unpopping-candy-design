# NotificationItem

> `social.notification-item` · `@unpopping-candy/social` · stable · version 0.1.0

Presents one social notification with actor context, event description, and optional target content.

## Import

```tsx
import { NotificationItem } from '@unpopping-candy/social';
```

```tsx
import { NotificationItem } from '@unpopping-candy/social/notification';
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

- `--popcandy-surface`
- `--popcandy-border`
- `--popcandy-ink-muted`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `locale` | `string \| undefined` | No | — |  |
| `notification` | `SocialNotificationViewModel` | Yes | — |  |
| `nowMs` | `number \| undefined` | No | — |  |
| `onSelect` | `(() => void) \| undefined` | No | — |  |

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

- `catalog-social-notificationitem--contract`

## Source

- `packages/social/src/notification/notification-item.tsx`
