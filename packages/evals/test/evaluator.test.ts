import assert from 'node:assert/strict';
import test from 'node:test';
import { bundledCatalog } from '../../knowledge/src/index.ts';
import { evaluateAgentOutput, evaluateScenarioSuite } from '../src/index.ts';

const complete = `
import { Alert, Button, EmptyState, Stack, TextField } from '@commonspace/ui';
export function LoginSurface({ loading, error, users }) {
  if (loading) return <p role="status">Loading</p>;
  if (error) return <Alert title="Login failed" description={error} tone="critical" />;
  if (users.length === 0) return <EmptyState title="No accounts" description="Create an account first." />;
  return <form aria-label="Sign in"><Stack><TextField label="Email" type="email" /><Button type="submit" pending={false}>Sign in</Button></Stack></form>;
}`;

const broken = `
import { Button } from '@commonspace/ui/src/button/button';
export const Login = () => <div style={{ color: '#ff00aa', padding: '17px' }}><button><span /></button><Button shadow="xl">Go</Button></div>;
`;

test('complete Commonspace output passes bounded quality thresholds', () => {
  const report = evaluateAgentOutput(bundledCatalog, { id: 'complete', mode: 'skill-mcp-storybook', task: 'Login form', requiredStates: ['loading', 'error', 'empty'], files: [{ path: 'login.tsx', content: complete }] });
  assert.equal(report.passed, true);
  assert.equal(report.metrics.invalidImports, 0);
  assert.equal(report.metrics.unknownProps, 0);
  assert.equal(report.metrics.hardcodedVisualValues, 0);
  assert.equal(report.metrics.accessibilityIssues, 0);
  assert.equal(report.metrics.stateCoverage, 1);
  assert.ok(report.score >= 85);
});

test('private imports, invented props, hardcoded values, and inaccessible controls fail', () => {
  const report = evaluateAgentOutput(bundledCatalog, { id: 'broken', mode: 'none', task: 'Login form', requiredStates: ['loading', 'error', 'empty'], files: [{ path: 'login.tsx', content: broken }] });
  assert.equal(report.passed, false);
  assert.ok(report.metrics.invalidImports >= 1);
  assert.ok(report.metrics.unknownProps >= 1);
  assert.ok(report.metrics.hardcodedVisualValues >= 2);
  assert.ok(report.metrics.accessibilityIssues >= 1);
  assert.equal(report.metrics.stateCoverage, 0);
});

test('scenario suite is deterministic and orders modes by declared sequence', () => {
  const scenarios = [
    { id: 'a', mode: 'none' as const, task: 'Login', requiredStates: ['loading'], files: [{ path: 'a.tsx', content: broken }] },
    { id: 'f', mode: 'skill-mcp-storybook' as const, task: 'Login', requiredStates: ['loading', 'error', 'empty'], files: [{ path: 'f.tsx', content: complete }] },
  ];
  const first = evaluateScenarioSuite(bundledCatalog, scenarios);
  const second = evaluateScenarioSuite(bundledCatalog, scenarios);
  assert.deepEqual(first, second);
  assert.deepEqual(first.scenarios.map((scenario) => scenario.mode), ['none', 'skill-mcp-storybook']);
  assert.equal(first.summary.passing, 1);
});

test('expected component recall measures catalog reuse without requiring exact markup', () => {
  const report = evaluateAgentOutput(bundledCatalog, {
    id: 'recall',
    mode: 'mcp',
    task: 'Profile form',
    expectedComponents: ['ui.alert', 'ui.button', 'ui.text-field'],
    files: [{ path: 'profile.tsx', content: `import { Button, TextField } from '@commonspace/ui'; export const Profile = () => <form aria-label="Profile"><TextField label="Name" /><Button>Save</Button></form>;` }],
  });
  assert.equal(report.metrics.componentRecall, 2 / 3);
  assert.deepEqual(report.missingComponents, ['ui.alert']);
});

test('reference benchmark demonstrates context-assisted quality without hiding failures', async () => {
  const { referenceAgentScenarios } = await import('../src/reference-scenarios.ts');
  const suite = evaluateScenarioSuite(bundledCatalog, referenceAgentScenarios);
  assert.equal(suite.scenarios.length, 6);
  assert.equal(suite.scenarios[0]?.mode, 'none');
  assert.equal(suite.scenarios.at(-1)?.mode, 'skill-mcp-storybook');
  assert.equal(suite.scenarios.find((scenario) => scenario.mode === 'none')?.passed, false);
  assert.equal(suite.scenarios.find((scenario) => scenario.mode === 'design-md')?.passed, false);
  assert.equal(suite.scenarios.find((scenario) => scenario.mode === 'skill')?.passed, false);
  assert.equal(suite.scenarios.find((scenario) => scenario.mode === 'mcp')?.passed, true);
  assert.equal(suite.scenarios.find((scenario) => scenario.mode === 'skill-mcp')?.passed, true);
  assert.equal(suite.scenarios.find((scenario) => scenario.mode === 'skill-mcp-storybook')?.passed, true);
  const scores = suite.scenarios.map((scenario) => scenario.score);
  assert.deepEqual(scores, [...scores].sort((a, b) => a - b));
});
