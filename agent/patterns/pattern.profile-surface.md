# Profile surface

> `pattern.profile-surface` · stable · version 0.2.0

Combines profile identity, relationship action, tabs, and state-complete collections.

## Use when

- A product needs the profile surface pattern.

## Avoid when

- A smaller primitive or a single component fully expresses the task.

## Anatomy

- Profile identity
- Primary relationship action
- Peer view tabs
- Collection region

## Components

- `social.profile-header`
- `social.user-cell`
- `ui.tabs`
- `ui.empty-state`
- `ui.alert`

## States

- loading
- self
- other
- private
- blocked
- not-found

## Responsive behavior

- Stack identity and actions on narrow screens.
- Keep the primary action visible without covering biography text.

## Flow

1. Load profile and relationship summary.
2. Choose the correct action state.
3. Render the selected collection.

## Accessibility

- Preserve semantic reading and focus order.
- Represent loading, error, and empty states explicitly.
