# Unpopping Candy agent evaluation baseline

This deterministic reference benchmark evaluates the same profile-settings task with progressively richer Unpopping Candy context. It is a regression fixture, not a claim about every model or prompt.

| Context mode | Score | Result | Component recall | State coverage | Invalid imports | Unknown props | Hardcoded values | A11y issues |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| none | 27 | Fail | 0% | 0% | 0 | 0 | 2 | 2 |
| design-md | 79 | Fail | 60% | 33% | 0 | 0 | 1 | 0 |
| skill | 93 | Fail | 80% | 67% | 0 | 0 | 0 | 0 |
| mcp | 100 | Pass | 100% | 100% | 0 | 0 | 0 | 0 |
| skill-mcp | 100 | Pass | 100% | 100% | 0 | 0 | 0 | 0 |
| skill-mcp-storybook | 100 | Pass | 100% | 100% | 0 | 0 | 0 | 0 |

## Release gate

The following modes must pass without private imports, invented props, hardcoded visual values, or basic accessibility failures:

- MCP;
- Skill + MCP;
- Skill + MCP + Storybook.

The no-context, DESIGN.md-only, and Skill-only fixtures intentionally preserve representative shortcomings so the evaluator proves that it can detect them.

## Metrics

- **Component recall:** expected Unpopping Candy components actually used.
- **State coverage:** required loading, error, empty, disabled, and pending states represented in source.
- **Invalid imports:** private paths or unknown Unpopping Candy entrypoints.
- **Unknown props:** props not present in the installed component contract.
- **Hardcoded visual values:** colors, spacing, radii, shadows, or gradients that bypass tokens.
- **Accessibility issues:** unnamed controls and images without alt text.

Generated from `@unpopping-candy/evals` and the installed `@unpopping-candy/knowledge` catalog.
