export type AgentContextMode =
  | 'none'
  | 'design-md'
  | 'skill'
  | 'mcp'
  | 'skill-mcp'
  | 'skill-mcp-storybook';

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
  severity: 'error' | 'warning';
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
  commonspaceReuse: number;
  componentRecall: number;
  commonspaceComponentsUsed: number;
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
    byMode: Readonly<Record<AgentContextMode, { total: number; passing: number; averageScore: number }>>;
  };
}
