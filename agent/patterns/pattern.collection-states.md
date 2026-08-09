# Collection states

> `pattern.collection-states` · stable · version 0.2.0

Provides complete loading, empty, populated, pagination, and error states for a collection.

## Use when

- A product needs the collection states pattern.

## Avoid when

- A smaller primitive or a single component fully expresses the task.

## Anatomy

- Collection heading
- Controls
- Result region
- Pagination status

## Components

- `ui.skeleton`
- `ui.empty-state`
- `ui.alert`
- `ui.button`
- `ui.stack`

## States

- initial-loading
- empty
- populated
- loading-more
- load-more-error
- filtered-empty

## Responsive behavior

- Maintain readable row widths.
- Keep existing rows visible when pagination fails.

## Flow

1. Load the first page.
2. Render the appropriate state.
3. Append pages without duplicate rows.

## Accessibility

- Preserve semantic reading and focus order.
- Represent loading, error, and empty states explicitly.
