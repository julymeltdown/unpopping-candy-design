# TextField

> `ui.text-field` · `@unpopping-candy/ui` · stable · version 0.1.0

Collects one short value with label, description, validation, and native input semantics.

## Import

```tsx
import { TextField } from '@unpopping-candy/ui';
```

```tsx
import { TextField } from '@unpopping-candy/ui/forms';
```

## Use when

- The user enters a concise value such as a name, email, or query.

## Avoid when

- Multi-line input is expected; use TextArea.
- A fixed choice set is known; use a selection control.

## Variants

- **text:** Use the text variant only when its semantic role matches the surrounding decision or content hierarchy.
- **email:** Use the email variant only when its semantic role matches the surrounding decision or content hierarchy.
- **password:** Use the password variant only when its semantic role matches the surrounding decision or content hierarchy.
- **search:** Use the search variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- empty
- filled
- focus
- disabled
- invalid

## Accessibility

- Every field requires a visible label or equivalent accessible name.
- Connect descriptions and errors with aria-describedby.
- Use an appropriate autocomplete value for personal data.


## Tokens

- `--popcandy-field-height`
- `--popcandy-border`
- `--popcandy-focus`
- `--popcandy-critical`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `description` | `string \| undefined` | No | — |  |
| `error` | `string \| undefined` | No | — |  |
| `hideLabel` | `boolean \| undefined` | No | — |  |
| `label` | `string` | Yes | — |  |
| `leadingIcon` | `ReactNode \| undefined` | No | — |  |
| `trailingElement` | `ReactNode \| undefined` | No | — |  |

## Preferred examples

### Email

Uses native semantics and autofill metadata.

```tsx
<TextField label="Email" type="email" autoComplete="email" />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.text-area`
- `pattern.form-actions`

## Storybook

- `catalog-ui-textfield--contract`

## Source

- `packages/ui/src/text-field/text-field.tsx`
