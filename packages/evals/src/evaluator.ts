import type { KnowledgeCatalog } from "@unpopping-candy/knowledge";
import type {
  AgentContextMode,
  AgentEvaluationReport,
  AgentEvaluationScenario,
  AgentEvaluationSuite,
  EvaluationFinding,
} from "./types.ts";
import {
  bounded,
  componentUsage,
  findAccessibilityIssues,
  findHardcodedVisualValues,
  findInvalidImports,
  findUnknownProps,
  normalizePath,
  stateIsCovered,
} from "./evaluator-analysis.ts";

const MODE_ORDER: readonly AgentContextMode[] = [
  "none",
  "design-md",
  "skill",
  "mcp",
  "skill-mcp",
  "skill-mcp-storybook",
];

export function evaluateAgentOutput(
  catalog: KnowledgeCatalog,
  scenario: AgentEvaluationScenario,
): AgentEvaluationReport {
  const findings: EvaluationFinding[] = [];
  const fullSource = scenario.files.map((file) => file.content).join("\n");
  let popcandyComponentsUsed = 0;
  let jsxComponentsUsed = 0;
  const usedComponentIds = new Set<string>();

  for (const file of scenario.files) {
    const path = normalizePath(file.path);
    findings.push(...findInvalidImports(catalog, path, file.content));
    findings.push(...findUnknownProps(catalog, path, file.content));
    findings.push(...findHardcodedVisualValues(path, file.content));
    findings.push(...findAccessibilityIssues(path, file.content));
    const usage = componentUsage(catalog, file.content);
    popcandyComponentsUsed += usage.popcandy;
    jsxComponentsUsed += usage.total;
    for (const id of usage.ids) usedComponentIds.add(id);
  }

  const requiredStates = [...new Set(scenario.requiredStates ?? [])]
    .map((state) => state.toLowerCase())
    .sort();
  const coveredStates = requiredStates.filter((state) =>
    stateIsCovered(state, fullSource),
  );
  const missingStates = requiredStates.filter(
    (state) => !coveredStates.includes(state),
  );
  for (const state of missingStates)
    findings.push({
      code: "missing-state",
      severity: "warning",
      path: scenario.files[0]?.path ?? ".",
      message: `Required ${state} state is not represented.`,
    });

  const expectedComponents = [
    ...new Set(scenario.expectedComponents ?? []),
  ].sort();
  const missingComponents = expectedComponents.filter(
    (id) => !usedComponentIds.has(id),
  );
  const componentRecall = expectedComponents.length
    ? (expectedComponents.length - missingComponents.length) /
      expectedComponents.length
    : 1;
  for (const id of missingComponents)
    findings.push({
      code: "missing-component",
      severity: "warning",
      path: scenario.files[0]?.path ?? ".",
      message: `Expected Unpopping Candy component ${id} is not used.`,
    });

  const metrics = {
    invalidImports: findings.filter(
      (finding) =>
        finding.code === "private-import" ||
        finding.code === "unknown-entrypoint",
    ).length,
    unknownProps: findings.filter((finding) => finding.code === "unknown-prop")
      .length,
    hardcodedVisualValues: findings.filter(
      (finding) =>
        finding.code.startsWith("hardcoded-") ||
        finding.code === "generic-gradient",
    ).length,
    accessibilityIssues: findings.filter((finding) =>
      ["unnamed-button", "missing-alt", "unnamed-field"].includes(finding.code),
    ).length,
    stateCoverage: requiredStates.length
      ? coveredStates.length / requiredStates.length
      : 1,
    popcandyReuse: jsxComponentsUsed
      ? popcandyComponentsUsed / jsxComponentsUsed
      : 0,
    componentRecall,
    popcandyComponentsUsed,
    jsxComponentsUsed,
  };

  let score = 100;
  score -= Math.min(40, metrics.invalidImports * 25);
  score -= Math.min(30, metrics.unknownProps * 12);
  score -= Math.min(24, metrics.hardcodedVisualValues * 6);
  score -= Math.min(24, metrics.accessibilityIssues * 12);
  score -= Math.round((1 - metrics.stateCoverage) * 15);
  if (metrics.popcandyReuse < 0.6)
    score -= Math.round(((0.6 - metrics.popcandyReuse) / 0.6) * 10);
  score -= Math.round((1 - metrics.componentRecall) * 12);
  score = bounded(score);

  const passed =
    score >= 85 &&
    metrics.invalidImports === 0 &&
    metrics.unknownProps === 0 &&
    metrics.hardcodedVisualValues === 0 &&
    metrics.accessibilityIssues === 0 &&
    metrics.stateCoverage >= 0.75 &&
    metrics.popcandyReuse >= 0.6 &&
    metrics.componentRecall >= 0.75;

  return {
    schemaVersion: 1,
    id: scenario.id,
    mode: scenario.mode,
    task: scenario.task,
    passed,
    score,
    metrics,
    coveredStates,
    missingStates,
    missingComponents,
    findings: findings.sort(
      (a, b) =>
        a.path.localeCompare(b.path) ||
        a.code.localeCompare(b.code) ||
        a.message.localeCompare(b.message),
    ),
  };
}

function modeSummary(
  reports: readonly AgentEvaluationReport[],
  mode: AgentContextMode,
) {
  const selected = reports.filter((report) => report.mode === mode);
  const passing = selected.filter((report) => report.passed).length;
  return {
    total: selected.length,
    passing,
    averageScore: selected.length
      ? Number(
          (
            selected.reduce((sum, report) => sum + report.score, 0) /
            selected.length
          ).toFixed(2),
        )
      : 0,
  };
}

export function evaluateScenarioSuite(
  catalog: KnowledgeCatalog,
  scenarios: readonly AgentEvaluationScenario[],
  generatedAt = "2026-08-09T00:00:00.000Z",
): AgentEvaluationSuite {
  const reports = scenarios
    .map((scenario) => evaluateAgentOutput(catalog, scenario))
    .sort(
      (a, b) =>
        MODE_ORDER.indexOf(a.mode) - MODE_ORDER.indexOf(b.mode) ||
        a.id.localeCompare(b.id),
    );
  const passing = reports.filter((report) => report.passed).length;
  return {
    schemaVersion: 1,
    generatedAt,
    scenarios: reports,
    summary: {
      total: reports.length,
      passing,
      failing: reports.length - passing,
      averageScore: reports.length
        ? Number(
            (
              reports.reduce((sum, report) => sum + report.score, 0) /
              reports.length
            ).toFixed(2),
          )
        : 0,
      byMode: Object.fromEntries(
        MODE_ORDER.map((mode) => [mode, modeSummary(reports, mode)]),
      ) as AgentEvaluationSuite["summary"]["byMode"],
    },
  };
}
