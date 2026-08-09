# Social feed

> `pattern.social-feed` · stable · version 0.2.0

Composes a readable, state-complete social timeline without moving content unexpectedly.

## Use when

- A product needs the social feed pattern.

## Avoid when

- A smaller primitive or a single component fully expresses the task.

## Anatomy

- Feed controls
- Composer
- New-item notice
- Timeline rows
- Pagination sentinel

## Components

- `social.timeline-view`
- `social.post-card`
- `social.post-card-skeleton`
- `social.post-composer-view`

## States

- initial-loading
- populated
- empty
- loading-more
- load-more-error
- new-items-available

## Responsive behavior

- Keep one reading column on narrow viewports.
- Do not insert new rows above the current viewport without user action.

## Flow

1. Load or restore a snapshot.
2. Render stable rows.
3. Poll or subscribe for new-item count.
4. Accept new items and reset to a new snapshot.

## Accessibility

- Preserve semantic reading and focus order.
- Represent loading, error, and empty states explicitly.
