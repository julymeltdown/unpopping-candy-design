# Agent evaluation harness

## Goal

`@commonspace/evals` measures whether agent-generated source actually uses Commonspace correctly. It is deterministic and can run without a model, browser, or network.

## Reference comparison modes

The committed reference suite evaluates the same interface task under progressively richer context:

```text
none
design-md
skill
mcp
skill-mcp
skill-mcp-storybook
```

The low-context fixtures intentionally preserve representative failures. They prove that the evaluator catches defects instead of making every fixture pass.

## Metrics

| Metric | Meaning |
|---|---|
| Invalid imports | Private paths or unknown Commonspace entrypoints |
| Unknown props | JSX props absent from the installed component contract |
| Hardcoded visual values | Colors, spacing, radii, shadows, or gradients bypassing tokens |
| Accessibility issues | Basic unnamed controls and missing image alternatives |
| State coverage | Required loading, empty, error, disabled, pending, and related states |
| Commonspace reuse | Share of JSX components sourced from Commonspace |
| Component recall | Expected Commonspace components present in the solution |

## Outputs

```text
agent/manifests/evals.json
docs/agent-evals/baseline.md
```

The optional `apps/agent-lab` Vite app renders the evaluation manifest for human inspection.

## Release gate

The reference modes using MCP must pass with:

- no invalid imports;
- no invented props;
- no hardcoded visual values;
- no basic accessibility failures;
- full expected-component recall.

`npm run evals:check` also requires monotonic reference scores as richer context is introduced.

## Running evaluations

```bash
npm run evals:generate
npm run evals:check
pnpm --filter @commonspace/agent-lab dev
```

## Adding a scenario

A scenario declares:

- stable ID;
- context mode;
- task;
- required states;
- expected component IDs;
- generated source files.

Add scenarios for recurring product surfaces and migration failures. Keep fixtures small enough that findings can be attributed to a clear contract.

## Limitations

The current evaluator is a static source-quality gate. It does not replace:

- TypeScript typecheck;
- package build;
- Storybook browser rendering;
- interaction tests;
- automated accessibility tooling;
- visual regression;
- human product-design review.
