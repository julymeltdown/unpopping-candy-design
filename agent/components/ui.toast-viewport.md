# ToastViewport

> `ui.toast-viewport` · `@commonspace/ui` · stable · version 0.1.0

Positions and announces the bounded stack of global feedback items.

## Import

```tsx
import { ToastViewport } from '@commonspace/ui';
```

```tsx
import { ToastViewport } from '@commonspace/ui/feedback';
```

## Use when

- FeedbackProvider needs a visible output region.

## Avoid when

- A page needs a custom notification center.

## Variants

- **top-right:** Use the top-right variant only when its semantic role matches the surrounding decision or content hierarchy.
- **bottom-right:** Use the bottom-right variant only when its semantic role matches the surrounding decision or content hierarchy.
- **bottom-center:** Use the bottom-center variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- empty
- populated

## Accessibility

- Avoid covering primary navigation and mobile safe areas.
- Keep DOM order consistent with announcement order.


## Tokens

- `--cs-dialog-width-sm`
- `--cs-space-4`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Default viewport

Binds queue state to presentation.

```tsx
<ToastViewport items={items} onDismiss={dismiss} />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.feedback-provider`
- `ui.toast`

## Storybook

- `catalog-ui--toast-viewport`

## Source

- `packages/ui/src/feedback/toast.tsx`
