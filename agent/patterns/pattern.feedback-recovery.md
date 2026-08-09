# Feedback and recovery

> `pattern.feedback-recovery` · stable · version 0.2.0

Chooses inline, global, or route-level feedback while preserving successful data and unfinished work.

## Use when

- A product needs the feedback and recovery pattern.

## Avoid when

- A smaller primitive or a single component fully expresses the task.

## Anatomy

- Failure boundary
- Preserved state statement
- Recovery action
- Request reference

## Components

- `ui.alert`
- `ui.feedback-provider`
- `ui.toast`
- `ui.empty-state`
- `ui.button`

## States

- recoverable
- offline
- rate-limited
- critical
- recovered

## Responsive behavior

- Keep inline feedback adjacent to its owning region.
- Place global toasts away from mobile navigation and safe areas.

## Flow

1. Classify the error.
2. State what remains preserved.
3. Offer one valid recovery action.
4. Dismiss or reconcile after recovery.

## Accessibility

- Preserve semantic reading and focus order.
- Represent loading, error, and empty states explicitly.
