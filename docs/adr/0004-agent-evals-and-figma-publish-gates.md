# ADR 0004: Treat agent evaluations and Figma mappings as release contracts

## Status

Accepted.

## Context

Calling a library AI-friendly without measuring generated output provides no regression protection. Publishing guessed Figma mappings creates false confidence and can direct agents to the wrong implementation.

## Decision

Maintain a deterministic agent-output evaluation harness and commit its baseline. Require rich-context reference modes to pass import, prop, token, accessibility, state, and component-reuse gates.

Generate Code Connect templates for every public component, but keep mappings in placeholder status until a real Figma component URL is supplied. `figma:publish-check` fails closed on placeholders.

## Consequences

- Agent-context changes can be compared through stable metrics.
- Low-context fixtures remain intentionally failing to prove evaluator sensitivity.
- Figma integration is visible before the organization supplies a design file, without pretending the connection is complete.
- Storybook and browser tests remain necessary; static evals do not replace them.
