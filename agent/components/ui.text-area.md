# TextArea

> `ui.text-area` · `@commonspace/ui` · stable · version 0.1.0

Collects multi-line text with label, description, validation, and native textarea semantics.

## Import

```tsx
import { TextArea } from '@commonspace/ui';
```

```tsx
import { TextArea } from '@commonspace/ui/forms';
```

## Use when

- The user writes more than one short line.

## Avoid when

- The value is a single concise field; use TextField.
- Rich text structure is required.

## Variants

- **default:** Use the default variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- empty
- filled
- focus
- disabled
- invalid

## Accessibility

- Every field requires a visible label or an equivalent accessible name.
- Connect descriptions and errors with aria-describedby.
- Expose aria-invalid when validation fails.


## Tokens

- `--cs-field-height`
- `--cs-border`
- `--cs-focus`
- `--cs-critical`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Biography

Associates label and validation feedback.

```tsx
<TextArea label="Biography" error={errors.bio} />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.text-field`
- `pattern.form-actions`

## Storybook

- `catalog-ui--text-area`

## Source

- `packages/ui/src/text-area/text-area.tsx`
