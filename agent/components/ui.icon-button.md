# IconButton

> `ui.icon-button` · `@unpopping-candy/ui` · stable · version 0.1.0

Triggers a frequent action where a well-known icon can replace visible text.

## Import

```tsx
import { IconButton } from '@unpopping-candy/ui';
```

```tsx
import { IconButton } from '@unpopping-candy/ui/button';
```

## Use when

- A compact toolbar or repeated row action has a familiar icon.

## Avoid when

- The action is unfamiliar or consequential; use a labeled Button.
- The icon is decorative.

## Variants

- **ghost:** Use the ghost variant only when its semantic role matches the surrounding decision or content hierarchy.
- **secondary:** Use the secondary variant only when its semantic role matches the surrounding decision or content hierarchy.
- **danger:** Use the danger variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default
- hover
- focus-visible
- disabled
- pressed

## Accessibility

- An aria-label is required.
- Tooltip text should match the accessible name.
- Pressed toggles must expose aria-pressed.


## Tokens

- `--popcandy-button-height-md`
- `--popcandy-focus`
- `--popcandy-ink-muted`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `icon` | `ReactNode` | Yes | — |  |
| `label` | `string` | Yes | — |  |
| `selected` | `boolean \| undefined` | No | — |  |
| `size` | `'sm' \| 'md' \| 'lg' \| undefined` | No | — |  |
| `tone` | `'neutral' \| 'accent' \| 'danger' \| undefined` | No | — |  |

## Preferred examples

### Toolbar action

Provides a stable accessible name.

```tsx
<IconButton aria-label="Bookmark post"><BookmarkIcon /></IconButton>
```

## Avoid examples

### Unnamed icon

Screen-reader users cannot identify the action.

```tsx
<IconButton><BookmarkIcon /></IconButton>
```

## Related

- `ui.button`

## Storybook

- `catalog-ui-icon-button--contract`

## Source

- `packages/ui/src/icon-button/icon-button.tsx`
