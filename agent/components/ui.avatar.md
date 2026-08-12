# Avatar

> `ui.avatar` · `@unpopping-candy/ui` · stable · version 0.1.0

Represents a person or organization with an image and deterministic fallback.

## Import

```tsx
import { Avatar } from '@unpopping-candy/ui';
```

```tsx
import { Avatar } from '@unpopping-candy/ui/avatar';
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

- `--popcandy-surface-muted`
- `--popcandy-border`
- `--popcandy-ink`

## Props

| Name | Type | Required | Default | Description |
|---|---|---:|---|---|
| `alt` | `string \| undefined` | No | — |  |
| `fallback` | `ReactNode \| undefined` | No | — |  |
| `loading` | `'eager' \| 'lazy' \| undefined` | No | — |  |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| undefined` | No | — |  |
| `src` | `string \| null \| undefined` | No | — |  |

## Preferred examples

### Identity row

Provides both image and fallback data.

```tsx
<Avatar src={user.avatarUrl} alt={user.displayName} fallback={user.initials} />
```

## Avoid examples

- No avoid example documented.

## Related

- `social.user-cell`

## Storybook

- `catalog-ui-avatar--contract`

## Source

- `packages/ui/src/avatar/avatar.tsx`
