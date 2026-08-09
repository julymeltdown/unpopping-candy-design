# Toast

> `ui.toast` · `@commonspace/ui` · stable · version 0.1.0

Renders one transient or persistent item from the feedback queue.

## Import

```tsx
import { Toast } from '@commonspace/ui';
```

```tsx
import { Toast } from '@commonspace/ui/feedback';
```

## Use when

- A result is global and does not require a fixed page position.

## Avoid when

- The message must remain beside its source; use Alert.

## Variants

- **neutral:** Use for non-semantic information.
- **success:** Use after an operation has completed.
- **warning:** Use for recoverable failure or degraded state.
- **critical:** Use for security, session, or unrecoverable failure.

## States

- entering
- visible
- leaving
- repeated

## Accessibility

- Neutral and success use polite live regions.
- Warning and critical use assertive announcements.
- Actions need clear labels and keyboard focus.


## Tokens

- `--cs-surface`
- `--cs-shadow-dialog`
- `--cs-positive`
- `--cs-warning`
- `--cs-critical`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Global confirmation

Communicates a short global result.

```tsx
feedback.show({ tone: 'success', title: 'Link copied' })
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.feedback-provider`
- `ui.toast-viewport`

## Storybook

- `catalog-ui--toast`

## Source

- `packages/ui/src/feedback/toast.tsx`
