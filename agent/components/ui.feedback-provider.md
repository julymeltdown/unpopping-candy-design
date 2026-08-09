# FeedbackProvider

> `ui.feedback-provider` · `@commonspace/ui` · stable · version 0.1.0

Owns the application-level transient feedback queue and exposes a bounded controller.

## Import

```tsx
import { FeedbackProvider } from '@commonspace/ui';
```

```tsx
import { FeedbackProvider } from '@commonspace/ui/feedback';
```

## Use when

- An application needs global confirmations and non-blocking errors.

## Avoid when

- Feedback belongs permanently beside a field or panel; use Alert.

## Variants

- **default:** Use the default variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- idle
- queued
- announcing

## Accessibility

- Mount one provider per feedback scope.
- Critical items remain until explicitly dismissed.
- Do not enqueue raw server messages.


## Tokens

- `--cs-dialog-width-sm`
- `--cs-shadow-dialog`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Application provider

Creates one deterministic queue.

```tsx
<FeedbackProvider><App /></FeedbackProvider>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.toast`
- `ui.toast-viewport`
- `ui.alert`

## Storybook

- `catalog-ui--feedback-provider`

## Source

- `packages/ui/src/feedback/feedback-provider.tsx`
