# Avatar

> `ui.avatar` · `@commonspace/ui` · stable · version 0.1.0

Represents a person or organization with an image and deterministic fallback.

## Import

```tsx
import { Avatar } from '@commonspace/ui';
```

```tsx
import { Avatar } from '@commonspace/ui/avatar';
```

## Use when

- An identity must remain recognizable at compact sizes.
- A profile image may fail and needs a text fallback.

## Avoid when

- The visual is decorative and has no identity meaning.
- A product or content thumbnail is being displayed.

## Variants

- **sm:** Use the sm variant only when its semantic role matches the surrounding decision or content hierarchy.
- **md:** Use the md variant only when its semantic role matches the surrounding decision or content hierarchy.
- **lg:** Use the lg variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- image
- fallback
- loading

## Accessibility

- Provide a useful accessible label through surrounding identity text.
- Use an empty alt value when the adjacent text already names the person.


## Tokens

- `--cs-surface-muted`
- `--cs-border`
- `--cs-ink`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Identity row

Provides both image and fallback data.

```tsx
<Avatar src={user.avatarUrl} name={user.displayName} />
```

## Avoid examples

- No avoid example documented.

## Related

- `social.user-cell`

## Storybook

- `catalog-ui-avatar--contract`

## Source

- `packages/ui/src/avatar/avatar.tsx`
