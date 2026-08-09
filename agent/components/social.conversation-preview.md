# ConversationPreview

> `social.conversation-preview` · `@commonspace/social` · stable · version 0.1.0

Presents a conversation summary with participants, latest message, time, and unread state.

## Import

```tsx
import { ConversationPreview } from '@commonspace/social';
```

```tsx
import { ConversationPreview } from '@commonspace/social/conversation';
```

## Use when

- A messaging inbox lists conversations.

## Avoid when

- A message bubble or full thread is required.

## Variants

- **direct:** Use the direct variant only when its semantic role matches the surrounding decision or content hierarchy.
- **group:** Use the group variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- read
- unread
- selected
- muted

## Accessibility

- Unread state needs text or a labelled indicator.
- The preview needs a clear accessible name combining participant and latest message.


## Tokens

- `--cs-surface`
- `--cs-border`
- `--cs-ink-muted`
- `--cs-accent`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `conversation` | `SocialConversationPreviewViewModel` | Yes | — |  |
| `locale` | `string \| undefined` | No | — |  |
| `nowMs` | `number \| undefined` | No | — |  |

## Preferred examples

### Inbox row

Injects navigation and keeps data ownership external.

```tsx
<ConversationPreview conversation={conversation} onSelect={openConversation} />
```

## Avoid examples

- No avoid example documented.

## Related

- `social.user-cell`
- `pattern.conversation-list`

## Storybook

- `catalog-social-conversation-preview--contract`

## Source

- `packages/social/src/conversation/conversation-preview.tsx`
