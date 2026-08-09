# IconButton

> `ui.icon-button` · `@commonspace/ui` · stable · version 0.1.0

Triggers a frequent action where a well-known icon can replace visible text.

## Import

```tsx
import { IconButton } from '@commonspace/ui';
```

```tsx
import { IconButton } from '@commonspace/ui/button';
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

- `--cs-button-height-md`
- `--cs-focus`
- `--cs-ink-muted`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

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

- `catalog-ui--icon-button`

## Source

- `packages/ui/src/icon-button/icon-button.tsx`
