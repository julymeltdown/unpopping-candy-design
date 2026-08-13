# PostComposerView

> `social.post-composer-view` · `@unpopping-candy/social` · stable · version 0.1.0

Presents a controlled social composer while the application owns draft, validation, upload, and publishing state.

## Import

```tsx
import { PostComposerView } from '@unpopping-candy/social';
```

```tsx
import { PostComposerView } from '@unpopping-candy/social/post';
```

## Use when

- A social product needs a reusable text-post composition surface.

## Avoid when

- The component would need to own persistence, authentication, or uploads.

## Variants

- **inline:** Use the inline variant only when its semantic role matches the surrounding decision or content hierarchy.
- **dialog:** Use the dialog variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- empty
- draft
- invalid
- publishing
- failed

## Accessibility

- The text field needs a clear label.
- Character limits and errors must be announced.
- Publishing must retain the draft until success.


## Tokens

- `--popcandy-surface`
- `--popcandy-border`
- `--popcandy-accent`
- `--popcandy-field-height`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `error` | `string \| undefined` | No | — |  |
| `feedback` | `ReactNode \| undefined` | No | — |  |
| `maximumLength` | `number \| undefined` | No | — |  |
| `onAddEmoji` | `(() => void) \| undefined` | No | — |  |
| `onAddMedia` | `(() => void) \| undefined` | No | — |  |
| `onSubmit` | `() => void` | Yes | — |  |
| `onValueChange` | `(value: string) => void` | Yes | — |  |
| `pending` | `boolean \| undefined` | No | — |  |
| `placeholder` | `string \| undefined` | No | — |  |
| `submitLabel` | `string \| undefined` | No | — |  |
| `value` | `string` | Yes | — |  |
| `viewer` | `SocialUserViewModel` | Yes | — |  |

## Preferred examples

### Controlled draft

Leaves workflow state in the consuming app.

```tsx
<PostComposerView viewer={viewer} value={draft} onValueChange={setDraft} onSubmit={publish} pending={pending} />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.text-area`
- `ui.button`
- `pattern.form-actions`

## Storybook

- `catalog-social-postcomposerview--contract`

## Source

- `packages/social/src/post-composer/post-composer-view.tsx`
