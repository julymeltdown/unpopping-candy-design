# Form actions

> `pattern.form-actions` · stable · version 0.2.0

Orders validation, pending behavior, primary action, and cancellation for a form.

## Use when

- A product needs the form actions pattern.

## Avoid when

- A smaller primitive or a single component fully expresses the task.

## Anatomy

- Form fields
- Inline validation
- Form-level feedback
- Primary and secondary actions

## Components

- `ui.text-field`
- `ui.text-area`
- `ui.button`
- `ui.inline`
- `ui.stack`
- `ui.alert`

## States

- pristine
- dirty
- invalid
- submitting
- failed
- succeeded

## Responsive behavior

- Stack actions on narrow screens when labels would wrap.
- Keep destructive actions separate from routine save actions.

## Flow

1. Validate fields.
2. Move focus to the first invalid field.
3. Submit once.
4. Preserve input on failure.

## Accessibility

- Preserve semantic reading and focus order.
- Represent loading, error, and empty states explicitly.
