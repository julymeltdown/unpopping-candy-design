# Commonspace UI Extraction Plan

## Goal

Turn the reusable visual layer of the existing Commonspace social application into a publishable, API-agnostic React component library.

## Work packages

1. Initialize publishable monorepo contracts and release policy.
2. Implement layered design tokens and theme scoping.
3. Extract semantic Ant Design icon wrappers.
4. Build the general UI package with stable entry points and state attributes.
5. Build the social presentation package with internal view models.
6. Add Storybook documentation and a Vite consumer playground.
7. Add package-boundary, export, CSS, pure-logic, and consumer-contract verification.
8. Complete repository and package documentation, then create a distributable archive.

## Acceptance criteria

- No publishable package exports `src`.
- No UI or social package imports app, API, auth, router, Query, SWR, or Zustand code.
- React and React DOM are peer dependencies with compatible ranges.
- All CSS selectors are prefixed or token-scoped.
- Theme, density, and high-contrast modes are documented.
- Social components render from serializable presentation models and callbacks only.
- Changesets and release CI are present.
- A consumer Vite app imports only public package entry points.
