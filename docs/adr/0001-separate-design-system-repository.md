# ADR 0001: Separate the design system from the application kit

## Status

Accepted.

## Context

The source social application combines reusable visual packages with JWT, TanStack Query, SWR, Zustand, FSD, and backend services. Publishing those concerns together would force consumers to adopt unrelated runtime decisions.

## Decision

Create a separate repository containing only tokens, theme, icons, general UI, social presentation patterns, documentation, and consumer fixtures. The original social application remains a reference consumer.

## Consequences

- Social components define presentation models instead of importing backend DTOs.
- Packages build to `dist` and expose only declared entry points.
- React is a peer dependency.
- The design system can be versioned independently with Changesets.
