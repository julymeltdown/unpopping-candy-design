# Component guidelines

## Decide the package first

A component belongs in `@commonspace/ui` when its meaning is product-independent. It belongs in `@commonspace/social` when it expresses a social/content concept but remains network-independent.

Do not place application features in either package.

```text
Button                 → ui
Dialog                 → ui
PostCard               → social
NotificationItem       → social
useLikePost mutation   → application, not this repository
```

## Public API requirements

A public component must:

- have one clear responsibility;
- use explicit props for controlled state;
- provide a documented uncontrolled mode when appropriate;
- preserve native element props where practical;
- forward the primary element ref when useful;
- accept `className` and documented style overrides where safe;
- expose stable `data-cs-component`, state, size, tone, and variant attributes;
- use semantic tokens;
- avoid network and application state;
- have package-level exports rather than internal-path imports.

## Controlled state

Use controlled/uncontrolled state for stateful primitives:

```tsx
<Dialog open={open} onOpenChange={setOpen} />
<Dialog defaultOpen />
```

A component must not silently switch between controlled and uncontrolled modes.

## Callbacks

Callbacks describe user intent, not transport details.

```tsx
<PostCard onLike={() => onLike(post.id)} />
```

Do not expose props such as `likeEndpoint`, `accessToken`, or `queryClient`.

## Presentation models

Social models should be:

- serializable;
- stable for rendering;
- free of methods and framework instances;
- independent from API naming accidents;
- explicit about viewer-specific state;
- explicit about absent/optional data.

## Accessibility

Before adding a component, define:

- semantic element or ARIA role;
- accessible name source;
- keyboard interaction;
- focus entry and restoration;
- disabled and pending behavior;
- live-region behavior;
- screen-reader treatment for icons/media;
- mobile target size;
- reduced-motion behavior.

## States to document

At minimum:

```text
default
hover
focus-visible
active/selected
disabled
pending/loading
error/invalid
empty
long content
mobile
compact density
dark theme
high contrast
reduced motion
```

## Styling

- use `.cs-*` for components and parts;
- use `.is-*` only for exposed state selectors;
- use `--cs-*` for custom properties;
- prefer tokens over literal values;
- prefer spacing and boundaries over ornamental shadows;
- do not use generated or arbitrary class names as the public API;
- do not use global element selectors except inside a component scope.

## Tests

Non-DOM state logic should be extracted into pure functions and tested with Node's test runner. DOM behavior belongs in Storybook interaction/browser tests.

Architecture verification should reject an invalid implementation rather than relying solely on review comments.

## Exports

Every public subpath has a source entry and `dist` export. Root barrels use explicit exports; wildcard exports are avoided to keep the public surface reviewable.

## Review questions

1. Is the component truly reusable across at least two product contexts?
2. Is it in the correct package?
3. Does it own only presentation state?
4. Can it render from fixtures without an app provider?
5. Does it preserve native semantics?
6. Are all visible states represented by tokens and attributes?
7. Does the consumer fixture still build?
8. Is a Changeset required?
