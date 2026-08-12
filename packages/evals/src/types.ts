export type AgentContextMode =
  | "none"
  | "design-md"
  | "skill"
  | "mcp"
  | "skill-mcp"
  | "skill-mcp-storybook";

export interface AgentSourceFile {
  path: string;
  content: string;
}

export interface AgentEvaluationScenario {
  id: string;
  mode: AgentContextMode;
  task: string;
  requiredStates?: readonly string[];
  expectedComponents?: readonly string[];
  files: readonly AgentSourceFile[];
}

export interface EvaluationFinding {
  code: string;
  severity: "error" | "warning";
  path: string;
  message: string;
  evidence?: string;
}

export interface AgentEvaluationMetrics {
  invalidImports: number;
  unknownProps: number;
  hardcodedVisualValues: number;
  accessibilityIssues: number;
  stateCoverage: number;
  popcandyReuse: number;
  componentRecall: number;
  popcandyComponentsUsed: number;
  jsxComponentsUsed: number;
}

export interface AgentEvaluationReport {
  schemaVersion: 1;
  id: string;
  mode: AgentContextMode;
  task: string;
  passed: boolean;
  score: number;
  metrics: AgentEvaluationMetrics;
  coveredStates: readonly string[];
  missingStates: readonly string[];
  missingComponents: readonly string[];
  findings: readonly EvaluationFinding[];
}

export interface AgentEvaluationSuite {
  schemaVersion: 1;
  generatedAt: string;
  scenarios: readonly AgentEvaluationReport[];
  summary: {
    total: number;
    passing: number;
    failing: number;
    averageScore: number;
    byMode: Readonly<
      Record<
        AgentContextMode,
        { total: number; passing: number; averageScore: number }
      >
    >;
  };
}

export type ModelEvaluationProvider = "codex" | "claude";
export type ModelEvaluationContextMode = "none" | "popcandy";
export type ModelEvaluationResult = "pass" | "fail";

export interface ModelEvaluationCapture {
  schemaVersion: 1;
  taskId: string;
  contextMode: ModelEvaluationContextMode;
  prompt: string;
  contextDigest: string;
  contextBytes: number;
  rawOutput: string;
  provider: ModelEvaluationProvider;
  model: string;
  providerCli: { name: string; version: string };
  timestamp: string;
  evaluatorVersion: string;
  repetition: number;
  result: ModelEvaluationResult;
  reason: string;
  usage: { inputTokens: number; outputTokens: number };
  estimatedUsd: number;
  evidencePath: string;
}

export interface ProviderCaptureOutput {
  output: string;
  usage: { inputTokens: number; outputTokens: number };
  raw: string;
}

export interface WilsonInterval {
  lower: number;
  upper: number;
}

export interface ModelEvaluationSummaryGroup {
  taskId: string;
  provider: ModelEvaluationProvider;
  model: string;
  contextMode: ModelEvaluationContextMode;
  captures: number;
  passing: number;
  complianceRate: number;
  confidence95: WilsonInterval;
  improvementPercentagePoints: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  estimatedUsd: number;
  newestCaptureAgeDays: number;
  oldestCaptureAgeDays: number;
  fiveRunComplete: boolean;
}

export interface ModelEvaluationSummary {
  schemaVersion: 1;
  generatedAt: string;
  groups: readonly ModelEvaluationSummaryGroup[];
}
