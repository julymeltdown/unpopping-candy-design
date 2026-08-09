# ToastViewport

> `ui.toast-viewport` · `@unpopping-candy/ui` · stable · version 0.1.0

Positions and announces the bounded stack of global feedback items.

## Import

```tsx
import { ToastViewport } from '@unpopping-candy/ui';
```

```tsx
import { ToastViewport } from '@unpopping-candy/ui/feedback';
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

- `--popcandy-dialog-width-sm`
- `--popcandy-space-4`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `items` | `readonly FeedbackItem[]` | Yes | — |  |
| `onDismiss` | `(id: string) => void` | Yes | — |  |

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

- `catalog-ui-toast-viewport--contract`

## Source

- `packages/ui/src/feedback/toast.tsx`
