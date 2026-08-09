# Component guidelines

## Definition of a public component

A public component has one reusable responsibility, a declared package export, a typed API, documented states, accessible behavior, component-adjacent knowledge metadata, and an executable Storybook contract.

A component is not complete because its JSX renders.

## Required file set

A typical component includes:

```text
packages/ui/src/button/
├─ button.tsx
├─ button.css
└─ button.docs.ts

apps/docs/stories/catalog/ui-button.stories.tsx
packages/ui/test/<relevant-pure-logic>.test.ts
```

The exact file split can differ, but the public responsibilities may not be omitted.

## Responsibility boundary

Create a component when at least one is true:

- it owns independent interaction behavior;
- it has a distinct accessibility contract;
- it is reused across surfaces;
- it has states requiring independent stories;
- it changes for reasons different from its parent;
- it defines a stable composition or extension boundary.

Do not create a public component solely to wrap one `<div>` with no semantic contract.

## Package placement

### `@unpopping-candy/ui`

Use for product-independent primitives and styled controls.

It must not know about:

```text
Post
User
Notification
Conversation
routing
server cache
JWT
API URLs
```

### `@unpopping-candy/social`

Use for social and content presentation models. It may understand a social `Post` view model, but not the backend DTO, Query cache, or route.

### `@unpopping-candy/icons`

Use semantic product names. Components should not import Ant Design icon implementation names directly when a semantic wrapper exists.

## Public API design

### Preserve native behavior

Where applicable, extend native element props and forward refs.

```ts
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pending?: boolean;
  pendingLabel?: string;
}
```

### Controlled and uncontrolled state

Support both only when the uncontrolled behavior is stable and unambiguous. Document ownership explicitly.

```tsx
<Tabs value={tab} onValueChange={setTab} />
<Tabs defaultValue="posts" />
```

### Composition

Prefer composition over a large matrix of Boolean props.

```tsx
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger asChild>
    <Button>Edit profile</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Edit profile</Dialog.Title>
    </Dialog.Header>
    <Dialog.Body>{form}</Dialog.Body>
    <Dialog.Footer>{actions}</Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
```

A focused convenience component may wrap a frequent composition, but the semantic behavior must remain clear.

### Public imports

Expose root and justified subpath imports through `package.json` exports.

```tsx
import { Button } from '@unpopping-candy/ui';
import { Button } from '@unpopping-candy/ui/button';
```

Never document source or `dist` internals.

## Styling contract

### Tokens

Use semantic and component tokens.

```css
.popcandy-button {
  min-block-size: var(--popcandy-button-height-md);
  color: var(--popcandy-ink);
  background: var(--popcandy-surface);
  border: 1px solid var(--popcandy-border);
}
```

Do not introduce a new token when an existing semantic token expresses the same intent.

### Namespace

```text
classes            .popcandy-*
state helpers      .is-*
custom properties  --popcandy-*
```

### State attributes

Expose stable state hooks where useful.

```html
<button
  data-popcandy-component="button"
  data-popcandy-size="md"
  data-popcandy-variant="primary"
  data-popcandy-state="pending"
>
```

Class names and undocumented descendants are not public styling APIs.

## Accessibility contract

Define before implementation:

- native role or element;
- accessible name;
- keyboard interaction;
- focus entry, movement, restoration, and escape;
- disabled and pending semantics;
- announcement behavior;
- color-independent state indication;
- reduced-motion behavior;
- reflow and touch-target behavior.

Use native HTML first. For complex composites, the public Unpopping Candy API may wrap an internal accessible primitive library, but consumers must not depend on that internal library.

## Component-adjacent knowledge metadata

Every public component requires a `*.docs.ts` entry containing:

```text
stable ID
name
package and version
status
summary
keywords
when to use
when to avoid
public entrypoints
variants
states
tokens
composition
accessibility
preferred and discouraged examples
related entries
Story IDs
optional Figma mapping metadata
```

Public props are compiler-derived from TypeScript source. Do not maintain a separate hand-written prop table unless a description or default cannot be inferred; contribute that information through the supported metadata schema rather than a duplicate list.

Example:

```ts
export default defineComponentDoc({
  id: 'ui.button',
  name: 'Button',
  kind: 'component',
  package: '@unpopping-candy/ui',
  version: '0.1.0',
  status: 'stable',
  summary: 'Triggers an immediate user action.',
  useWhen: ['The user can perform a clear immediate action.'],
  avoidWhen: ['Navigation is the actual behavior; use a link.'],
  entrypoints: ['@unpopping-candy/ui', '@unpopping-candy/ui/button'],
  states: ['default', 'hover', 'focus', 'disabled', 'pending'],
  tokens: ['--popcandy-button-height-md', '--popcandy-accent', '--popcandy-focus-ring'],
  accessibility: {
    requirements: [
      'Use a visible label unless IconButton is intended.',
      'Pending state preserves an accessible action name.',
    ],
  },
  examples: {
    preferred: [{
      title: 'Submit a form',
      code: '<Button type="submit" pending={saving}>Save profile</Button>',
    }],
    avoid: [],
  },
  stories: ['catalog-ui-button--contract'],
});
```

## Storybook contract

Every public component must have a dedicated catalog story. Metadata and source must agree on a stable Story ID.

Cover all declared states, variants, and key content stress cases. Include interaction tests when behavior exists and accessibility checks in browser mode.

`npm run stories:check` verifies the static contract; it does not replace Storybook browser tests.

## Figma contract

The knowledge compiler creates a Code Connect template for each component. The template must use the public import and a preferred valid example.

Do not insert guessed Figma URLs. Keep the mapping as a placeholder until the real Figma component exists, then follow [Figma integration](./FIGMA.md).

## Evaluation impact

Public component changes can alter agent-output validation. Review:

- props extracted by the catalog compiler;
- expected component IDs in eval scenarios;
- Registry templates using the component;
- Story IDs;
- generated docs and Figma templates.

Do not introduce a second static prop table in `@unpopping-candy/evals` or another AI package.

## Testing

### Pure tests

Use for token logic, state reducers, formatter behavior, sanitization, registry actions, metadata validation, and other non-DOM behavior.

### Component stories and interaction tests

Use for visible variants, keyboard interaction, focus, and accessibility.

### Consumer fixture

Use to prove built package exports and declarations work without source aliases.

### Architecture tests

Add a regression fixture when changing a verifier. A verifier is not trusted solely because it passes the current repository.

## Release impact

Add a Changeset for public changes.

```text
patch
→ compatible defect fix or documentation correction with shipped-package effect

minor
→ compatible component, prop, token, pattern, template, or tooling addition

major
→ removed/renamed export, required prop, token removal, incompatible behavior, accessibility contract change
```

## Completion checklist

- [ ] responsibility and package boundary are clear;
- [ ] typed public API and ref/native behavior are correct;
- [ ] CSS uses Unpopping Candy tokens and namespaces;
- [ ] accessible semantics and keyboard behavior are defined;
- [ ] adjacent metadata exists;
- [ ] Storybook contract exists;
- [ ] pure and interaction tests exist where applicable;
- [ ] generated agent artifacts are current;
- [ ] Figma template is current;
- [ ] Registry templates and eval scenarios are reviewed;
- [ ] Changeset is added;
- [ ] `npm run test:pure` passes;
- [ ] `npm run verify` passes;
- [ ] dependency-aware typecheck/build passes before release.
