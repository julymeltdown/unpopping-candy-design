import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { bundledCatalog } from '../packages/knowledge/src/index.ts';
import { evaluateScenarioSuite } from '../packages/evals/src/evaluator.ts';
import { referenceAgentScenarios } from '../packages/evals/src/reference-scenarios.ts';
import { stableStringify } from '../packages/knowledge/src/stable-json.ts';

const repositoryRoot = resolve(new URL('..', import.meta.url).pathname);
const checkOnly = process.argv.includes('--check');
const generatedAt = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1_000).toISOString()
  : '2026-08-09T00:00:00.000Z';

function markdown(suite) {
  const rows = suite.scenarios.map((scenario) => [
    scenario.mode,
    String(scenario.score),
    scenario.passed ? 'Pass' : 'Fail',
    `${Math.round(scenario.metrics.componentRecall * 100)}%`,
    `${Math.round(scenario.metrics.stateCoverage * 100)}%`,
    String(scenario.metrics.invalidImports),
    String(scenario.metrics.unknownProps),
    String(scenario.metrics.hardcodedVisualValues),
    String(scenario.metrics.accessibilityIssues),
  ]);
  return `# Commonspace agent evaluation baseline

This deterministic reference benchmark evaluates the same profile-settings task with progressively richer Commonspace context. It is a regression fixture, not a claim about every model or prompt.

| Context mode | Score | Result | Component recall | State coverage | Invalid imports | Unknown props | Hardcoded values | A11y issues |
|---|---:|---|---:|---:|---:|---:|---:|---:|
${rows.map((row) => `| ${row.join(' | ')} |`).join('\n')}

## Release gate

The following modes must pass without private imports, invented props, hardcoded visual values, or basic accessibility failures:

- MCP;
- Skill + MCP;
- Skill + MCP + Storybook.

The no-context, DESIGN.md-only, and Skill-only fixtures intentionally preserve representative shortcomings so the evaluator proves that it can detect them.

## Metrics

- **Component recall:** expected Commonspace components actually used.
- **State coverage:** required loading, error, empty, disabled, and pending states represented in source.
- **Invalid imports:** private paths or unknown Commonspace entrypoints.
- **Unknown props:** props not present in the installed component contract.
- **Hardcoded visual values:** colors, spacing, radii, shadows, or gradients that bypass tokens.
- **Accessibility issues:** unnamed controls and images without alt text.

Generated from \`@commonspace/evals\` and the installed \`@commonspace/knowledge\` catalog.
`;
}

function assertReleaseGate(suite) {
  const requiredPassingModes = new Set(['mcp', 'skill-mcp', 'skill-mcp-storybook']);
  const errors = [];
  const scores = suite.scenarios.map((scenario) => scenario.score);
  for (let index = 1; index < scores.length; index += 1) {
    if ((scores[index] ?? 0) < (scores[index - 1] ?? 0)) errors.push('Reference evaluation scores must be monotonic by context mode.');
  }
  for (const scenario of suite.scenarios) {
    if (!requiredPassingModes.has(scenario.mode)) continue;
    if (!scenario.passed) errors.push(`${scenario.mode}: expected the reference scenario to pass.`);
    for (const metric of ['invalidImports', 'unknownProps', 'hardcodedVisualValues', 'accessibilityIssues']) {
      if (scenario.metrics[metric] !== 0) errors.push(`${scenario.mode}: ${metric} must be zero.`);
    }
    if (scenario.metrics.componentRecall !== 1) errors.push(`${scenario.mode}: component recall must be 100%.`);
  }
  if (errors.length) throw new Error(`Agent evaluation release gate failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

async function writeOrCheck(outputs) {
  const stale = [];
  for (const [path, content] of outputs) {
    let current = null;
    try { current = await readFile(path, 'utf8'); } catch {}
    if (current === content) continue;
    if (checkOnly) stale.push(relative(repositoryRoot, path));
    else {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, 'utf8');
    }
  }
  if (stale.length) throw new Error(`Generated agent evaluations are stale:\n${stale.map((path) => `- ${path}`).join('\n')}`);
}

const suite = evaluateScenarioSuite(bundledCatalog, referenceAgentScenarios, generatedAt);
assertReleaseGate(suite);
await writeOrCheck(new Map([
  [join(repositoryRoot, 'agent/manifests/evals.json'), stableStringify(suite)],
  [join(repositoryRoot, 'docs/agent-evals/baseline.md'), markdown(suite)],
]));
console.log(`${checkOnly ? 'Verified' : 'Generated'} ${suite.scenarios.length} agent evaluation scenarios (${suite.summary.passing} passing).`);
