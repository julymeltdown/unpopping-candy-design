# Architecture

## Purpose

Commonspace UI is a design-system repository, not an application framework. Its architecture is designed to preserve three properties:

1. packages can be installed independently;
2. presentational packages do not acquire application dependencies;
3. the public contract is represented by package exports, types, tokens, and documented state attributes.

## Package graph

```text
                         ┌──────────────────────┐
                         │ @commonspace/theme   │
                         └──────────▲───────────┘
                                    │
┌──────────────────────┐            │
│ @commonspace/tokens  │────────────┼──────────────────────────┐
└──────────▲───────────┘            │                          │
           │                        │                          │
           │              ┌─────────┴─────────┐                │
           └──────────────│ @commonspace/ui   │◀──────┐        │
                          └─────────▲─────────┘       │        │
                                    │                 │        │
                          ┌─────────┴─────────┐       │        │
                          │@commonspace/social│───────┘        │
                          └───────────────────┘                │
                                                              │
                          ┌────────────────────┐               │
                          │@commonspace/icons  │───────────────┘
                          └────────────────────┘
```

The effective runtime graph is:

```text
tokens  → no dependencies
theme   → React + tokens
icons   → React + Ant Design Icons
ui      → React + tokens + icons
social  → React + tokens + icons + ui
```

## Why application concerns are excluded

The source application uses JWT authentication, TanStack Query, SWR, Zustand, React Router, Feature-Sliced Design, and backend services. Bundling those with visual components would force unrelated decisions on consumers and make package versioning depend on the application runtime.

The following therefore remain outside this repository:

```text
authentication and authorization
API clients and generated DTOs
remote-state caches
client workflow stores
routing
application feature slices
backend services
```

## Presentation models

The social package uses presentation models that describe only what the component needs to render and which viewer states it exposes. They are not persistence entities and are not wire contracts.

```text
API response
→ consuming application's entity mapper
→ Commonspace presentation model
→ social component
```

This boundary permits the same component to work with REST, GraphQL, local fixtures, Firebase, or any other source.

## Public API

The public API consists of:

- package names and declared subpath exports;
- emitted TypeScript declarations;
- component props and callbacks;
- semantic design tokens;
- documented `data-cs-*` attributes;
- documented behavior and accessibility semantics.

The following are internal and may change without direct compatibility guarantees:

- `src` paths;
- internal file names;
- DOM nesting beneath documented component roots;
- internal classes not documented as extension points;
- backing icon component names;
- bundler chunk names.

## Build model

Packages build ESM library output to `dist`.

```text
source TypeScript / TSX
→ Vite library build for JavaScript
→ TypeScript declaration build
→ static CSS/token asset copy
→ package exports point only to dist
```

React and React DOM remain external peer dependencies. Workspace dependencies use the `workspace:` protocol during development and are converted by the package manager at publish time.

## Consumer acceptance model

The Vite playground is optimized for design-system development and aliases package source. It does not prove published-package correctness.

The consumer fixture is the acceptance boundary:

```text
built package dist
→ package.json exports
→ consumer Vite resolver
→ consumer typecheck/build
```

No source alias is permitted in that app.

## Static architecture gates

### Package manifest contract

All publishable packages must expose `dist`, declare licensing and publication metadata, use ESM, include package documentation, and define build/test/typecheck scripts.

### Dependency boundary contract

The scanner parses static, side-effect, export, and dynamic imports and compares them with each package's allowed dependencies. It additionally scans for forbidden runtime patterns.

### Export contract

Every JavaScript entry point exposes an ESM implementation and declaration file. CSS and JSON assets must have corresponding source assets. Export targets may not reference `src`.

### CSS contract

Custom properties and public classes use Commonspace namespaces. The scanner is covered by tests to prevent false positives from BEM modifiers.

## Changes and compatibility

A compatibility assessment is required when changing:

- a component prop or callback;
- a presentation model field;
- a token name or meaning;
- a package export;
- an accessibility behavior;
- a documented state attribute;
- required style import order.

Changesets records the affected package and SemVer impact. Internal refactors with no public effect may use patch changes only when a release is necessary.
