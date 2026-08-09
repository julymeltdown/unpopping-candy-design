# Dialog

> `ui.dialog` · `@commonspace/ui` · stable · version 0.1.0

Interrupts the current context for a focused task that must be completed or dismissed.

## Import

```tsx
import { Dialog } from '@commonspace/ui';
```

```tsx
import { Dialog } from '@commonspace/ui/dialog';
```

## Use when

- A short focused task cannot fit safely inline.
- A destructive action needs confirmation and consequence text.

## Avoid when

- The content is a full workflow or route.
- A non-blocking message is sufficient.

## Variants

- **sm:** Use the sm variant only when its semantic role matches the surrounding decision or content hierarchy.
- **md:** Use the md variant only when its semantic role matches the surrounding decision or content hierarchy.
- **lg:** Use the lg variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- closed
- opening
- open
- closing

## Accessibility

- Move focus into the dialog on open and restore it on close.
- Provide a labelled title and optional description.
- Escape closes unless an irreversible operation is in progress.


## Tokens

- `--cs-dialog-width-md`
- `--cs-surface`
- `--cs-shadow-dialog`
- `--cs-focus`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Confirm action

Labels the modal and keeps open state controlled.

```tsx
<Dialog open={open} onOpenChange={setOpen} title="Delete post?">...</Dialog>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.button`
- `ui.alert`

## Storybook

- `catalog-ui-dialog--contract`

## Source

- `packages/ui/src/dialog/dialog.tsx`
