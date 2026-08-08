# Commonspace UI Design Contract

Commonspace UI is a reusable React design system for content-rich and social products. It keeps product content visually dominant, makes state explicit, and refuses to own application data or networking.

## System promise

1. Content leads; chrome recedes.
2. Every interactive state is keyboard reachable and visibly focused.
3. Feedback explains what changed, what was preserved, and what the user can do next.
4. Components are controlled by consumer data and callbacks; they do not fetch.
5. Themes are CSS-variable contracts, not hidden runtime styling.
6. Product patterns may express social concepts but never import an API DTO, router, cache, auth runtime, or application slice.

## Package boundaries

- `@commonspace/tokens`: reference, semantic, and component tokens.
- `@commonspace/theme`: theme and density scoping.
- `@commonspace/icons`: semantic wrappers around Ant Design Icons.
- `@commonspace/ui`: product-independent components.
- `@commonspace/social`: API-independent social presentation patterns.

Authentication, server state, FSD application structure, API clients, and backend services belong to the separate Commonspace App Kit, not this library.

## Visual language

- Neutral canvas and surfaces.
- One restrained accent role.
- Borders and spacing before shadows.
- Radius is functional, not decorative.
- Images and authored content provide most color.
- Status colors are reserved for actual state.
- No ornamental gradients, glass effects, fake metrics, or decorative badges.

## API language

- Native element props remain available where practical.
- Public components forward refs.
- Controlled and uncontrolled forms are explicit.
- `data-*` attributes expose state for styling and tests.
- Public exports are stable package entry points; internal paths are not contracts.
