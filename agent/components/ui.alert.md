# Alert

> `ui.alert` · `@commonspace/ui` · stable · version 0.1.0

Presents contextual feedback beside the task or content that produced it.

## Import

```tsx
import { Alert } from '@commonspace/ui';
```

```tsx
import { Alert } from '@commonspace/ui/alert';
```

## Use when

- A message must remain visible until the user resolves or dismisses its cause.
- The message belongs to a specific form, panel, or data region.

## Avoid when

- A short global confirmation is sufficient; use FeedbackProvider and Toast.
- The entire route is unusable; use a route-level error surface.

## Variants

- **neutral:** Use the neutral variant only when its semantic role matches the surrounding decision or content hierarchy.
- **success:** Use the success variant only when its semantic role matches the surrounding decision or content hierarchy.
- **warning:** Use the warning variant only when its semantic role matches the surrounding decision or content hierarchy.
- **critical:** Use the critical variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default
- with-action
- dismissible

## Accessibility

- Use role=status for neutral and success feedback.
- Use role=alert for warning and critical feedback.
- Keep the title specific and state what remains preserved.


## Tokens

- `--cs-surface`
- `--cs-border`
- `--cs-positive`
- `--cs-warning`
- `--cs-critical`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Recoverable failure

Names the failure and preserved state.

```tsx
<Alert tone="warning" title="Could not refresh posts">Existing posts remain available.</Alert>
```

## Avoid examples

### Raw server error

May expose unsafe or irrelevant implementation details.

```tsx
<Alert title={error.message} />
```

## Related

- `ui.toast`
- `ui.empty-state`
- `pattern.feedback-recovery`

## Storybook

- `catalog-ui--alert`

## Source

- `packages/ui/src/alert/alert.tsx`
