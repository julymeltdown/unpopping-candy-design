# PostComposerView

> `social.post-composer-view` · `@commonspace/social` · stable · version 0.1.0

Presents a controlled social composer while the application owns draft, validation, upload, and publishing state.

## Import

```tsx
import { PostComposerView } from '@commonspace/social';
```

```tsx
import { PostComposerView } from '@commonspace/social/post';
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

- `--cs-surface`
- `--cs-border`
- `--cs-accent`
- `--cs-field-height`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Controlled draft

Leaves workflow state in the consuming app.

```tsx
<PostComposerView value={draft} onChange={setDraft} onSubmit={publish} pending={pending} />
```

## Avoid examples

- No avoid example documented.

## Related

- `ui.text-area`
- `ui.button`
- `pattern.form-actions`

## Storybook

- `catalog-social-post-composer-view--contract`

## Source

- `packages/social/src/post-composer/post-composer-view.tsx`
