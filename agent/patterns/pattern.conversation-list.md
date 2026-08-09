# Conversation list

> `pattern.conversation-list` · stable · version 0.2.0

Renders conversations with stable selection, unread semantics, and responsive detail navigation.

## Use when

- A product needs the conversation list pattern.

## Avoid when

- A smaller primitive or a single component fully expresses the task.

## Anatomy

- Inbox heading
- Conversation rows
- Unread indicator
- Selected detail boundary

## Components

- `social.conversation-preview`
- `ui.empty-state`
- `ui.skeleton`
- `ui.alert`

## States

- loading
- empty
- populated
- selected
- offline

## Responsive behavior

- Use a single-column route transition on small screens.
- Use split view only when both panes remain usable.

## Flow

1. Load conversations.
2. Restore selected conversation from the URL.
3. Reconcile realtime updates without losing selection.

## Accessibility

- Preserve semantic reading and focus order.
- Represent loading, error, and empty states explicitly.
