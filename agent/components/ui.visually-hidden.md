# VisuallyHidden

> `ui.visually-hidden` · `@commonspace/ui` · stable · version 0.1.0

Keeps essential text available to assistive technology without changing visual layout.

## Import

```tsx
import { VisuallyHidden } from '@commonspace/ui';
```

## Use when

- An icon-only control or visual pattern needs an accessible text equivalent.

## Avoid when

- Content should be hidden from everyone; do not render it.
- Visible instructions would benefit all users.

## Variants

- **default:** Use the default variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default

## Accessibility

- Hidden text must remain in the accessibility tree.
- Do not use it to conceal focusable controls.


## Tokens

- `--cs-space-0`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Loading name

Retains an accessible name.

```tsx
<Spinner><VisuallyHidden>Loading posts</VisuallyHidden></Spinner>
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.icon-button`
- `ui.spinner`

## Storybook

- `catalog-ui--visually-hidden`

## Source

- `packages/ui/src/visually-hidden/visually-hidden.tsx`
