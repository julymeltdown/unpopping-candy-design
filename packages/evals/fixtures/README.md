# Reference evaluation fixtures

This private repository tooling includes a deterministic six-mode benchmark for the same profile-settings task. `@unpopping-candy/evals` is not published to npm:

1. no design context;
2. generated `DESIGN.md`;
3. Agent Skill;
4. MCP;
5. Skill + MCP;
6. Skill + MCP + Storybook verification.

The source strings live in `src/reference-scenarios.ts` so consumers can execute the same suite with the installed catalog version.
