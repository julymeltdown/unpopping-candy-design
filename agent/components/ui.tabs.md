# Tabs

> `ui.tabs` · `@commonspace/ui` · stable · version 0.1.0

Switches among peer views that share one context and URL or controlled state.

## Import

```tsx
import { Tabs } from '@commonspace/ui';
```

```tsx
import { Tabs } from '@commonspace/ui/tabs';
```

## Use when

- A region has a small set of mutually exclusive peer views.

## Avoid when

- The choices submit form data; use RadioGroup.
- The targets are unrelated pages in global navigation.

## Variants

- **line:** Use the line variant only when its semantic role matches the surrounding decision or content hierarchy.
- **compact:** Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- default
- selected
- focus-visible
- disabled

## Accessibility

- Use tablist, tab, and tabpanel semantics.
- Support arrow-key movement and stable focus.
- Reflect restorable view state in the URL when appropriate.


## Tokens

- `--cs-accent`
- `--cs-border`
- `--cs-focus`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Profile views

Keeps selection controlled and explicit.

```tsx
<Tabs value={tab} onValueChange={setTab} items={items} />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.button`

## Storybook

- `catalog-ui--tabs`

## Source

- `packages/ui/src/tabs/tabs.tsx`
