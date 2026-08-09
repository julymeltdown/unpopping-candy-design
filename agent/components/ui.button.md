# Button

> `ui.button` · `@unpopping-candy/ui` · stable · version 0.1.0

Triggers an immediate user action with explicit priority and pending behavior.

## Import

```tsx
import { Button } from '@unpopping-candy/ui';
```

```tsx
import { Button } from '@unpopping-candy/ui/button';
```

## Use when

- The user can perform an immediate action.
- A decision region needs one clearly prioritized primary action.

## Avoid when

- The target is navigation; use a link.
- The control only contains an icon; use IconButton.

## Variants

- **primary:** Use the primary variant only when its semantic role matches the surrounding decision or content hierarchy.
- **secondary:** Use the secondary variant only when its semantic role matches the surrounding decision or content hierarchy.
- **ghost:** Use the ghost variant only when its semantic role matches the surrounding decision or content hierarchy.
- **danger:** Use the danger variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default
- hover
- focus-visible
- disabled
- pending

## Accessibility

- Use an action verb as the accessible name.
- Pending state must preserve the accessible name and disable duplicate submission.
- Use danger only for destructive actions with clear consequences.


## Tokens

- `--popcandy-button-height-md`
- `--popcandy-accent`
- `--popcandy-critical`
- `--popcandy-focus`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `fullWidth` | `boolean \| undefined` | No | — |  |
| `leadingIcon` | `ReactNode \| undefined` | No | — |  |
| `pending` | `boolean \| undefined` | No | — |  |
| `pendingLabel` | `string \| undefined` | No | — |  |
| `size` | `ButtonSize \| undefined` | No | — |  |
| `trailingIcon` | `ReactNode \| undefined` | No | — |  |
| `variant` | `ButtonVariant \| undefined` | No | — |  |

## Preferred examples

### Primary action

One clear verb and stable pending state.

```tsx
<Button pending={isSaving}>Save changes</Button>
```

## Avoid examples

### Navigation

Navigation should preserve link semantics.

```tsx
<Button onClick={() => navigate('/settings')}>Settings</Button>
```

## Related

- `ui.icon-button`
- `pattern.form-actions`

## Storybook

- `catalog-ui-button--contract`

## Source

- `packages/ui/src/button/button.tsx`
