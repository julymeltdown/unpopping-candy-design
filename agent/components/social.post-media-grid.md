# PostMediaGrid

> `social.post-media-grid` · `@commonspace/social` · stable · version 0.1.0

Arranges one to four social media assets with stable aspect ratios and selection callbacks.

## Import

```tsx
import { PostMediaGrid } from '@commonspace/social';
```

```tsx
import { PostMediaGrid } from '@commonspace/social/post';
```

## Use when

- A post contains one to four media assets.

## Avoid when

- Media requires editing or upload management.
- A general image gallery is being built.

## Variants

- **one:** Use the one variant only when its semantic role matches the surrounding decision or content hierarchy.
- **two:** Use the two variant only when its semantic role matches the surrounding decision or content hierarchy.
- **three:** Use the three variant only when its semantic role matches the surrounding decision or content hierarchy.
- **four:** Use the four variant only when its semantic role matches the surrounding decision or content hierarchy.

## States

- loading
- ready
- error

## Accessibility

- Every image needs useful alt text or an explicit decorative alt.
- Buttons opening media need labels that identify the selected item.


## Tokens

- `--cs-border`
- `--cs-radius-md`

## Props

Props follow the exported TypeScript interface. Use the CLI or package declaration for the exact installed-version type.

## Preferred examples

### Post media

Uses application-owned media behavior.

```tsx
<PostMediaGrid media={post.media} onOpenMedia={openMedia} />
```

## Avoid examples

- No avoid example documented.

## Related

- `social.post-card`

## Storybook

- `catalog-social--post-media-grid`

## Source

- `packages/social/src/post-card/post-media-grid.tsx`
