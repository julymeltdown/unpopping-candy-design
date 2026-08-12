import { parseModelEvaluationCapture } from "./model-captures.ts";
import type {
  ModelEvaluationCapture,
  ModelEvaluationSummary,
  ModelEvaluationSummaryGroup,
  WilsonInterval,
} from "./types.ts";

const DAY_MS = 86_400_000;

function round(value: number, places = 8): number {
  const scale = 10 ** places;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}

export function wilsonInterval(
  successes: number,
  total: number,
): WilsonInterval {
  if (
    !Number.isSafeInteger(successes) ||
    !Number.isSafeInteger(total) ||
    successes < 0 ||
    total < 0 ||
    successes > total
  ) {
    throw new Error(
      "Wilson interval requires integer successes between zero and total.",
    );
  }
  if (total === 0) return { lower: 0, upper: 1 };
  const z = 1.959963984540054;
  const ratio = successes / total;
  const denominator = 1 + (z * z) / total;
  const center = ratio + (z * z) / (2 * total);
  const margin =
    z * Math.sqrt((ratio * (1 - ratio) + (z * z) / (4 * total)) / total);
  return {
    lower: round((center - margin) / denominator),
    upper: round((center + margin) / denominator),
  };
}

function groupKey(capture: ModelEvaluationCapture): string {
  return [
    capture.taskId,
    capture.provider,
    capture.model,
    capture.contextMode,
  ].join("|");
}

function baseKey(capture: ModelEvaluationCapture): string {
  return [capture.taskId, capture.provider, capture.model].join("|");
}

function summarizeGroup(
  captures: readonly ModelEvaluationCapture[],
  now: Date,
  noContextRate: number,
): ModelEvaluationSummaryGroup {
  const first = captures[0];
  if (!first) throw new Error("Cannot summarize an empty capture group.");
  const passing = captures.filter(
    (capture) => capture.result === "pass",
  ).length;
  const complianceRate = passing / captures.length;
  const totalInputTokens = captures.reduce(
    (total, capture) => total + capture.usage.inputTokens,
    0,
  );
  const totalOutputTokens = captures.reduce(
    (total, capture) => total + capture.usage.outputTokens,
    0,
  );
  const ages = captures.map(
    (capture) =>
      (now.getTime() - new Date(capture.timestamp).getTime()) / DAY_MS,
  );
  const repetitions = new Set(captures.map((capture) => capture.repetition));
  return {
    taskId: first.taskId,
    provider: first.provider,
    model: first.model,
    contextMode: first.contextMode,
    captures: captures.length,
    passing,
    complianceRate: round(complianceRate),
    confidence95: wilsonInterval(passing, captures.length),
    improvementPercentagePoints: round(
      (complianceRate - noContextRate) * 100,
      6,
    ),
    totalInputTokens,
    totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    estimatedUsd: round(
      captures.reduce((total, capture) => total + capture.estimatedUsd, 0),
    ),
    newestCaptureAgeDays: round(Math.min(...ages)),
    oldestCaptureAgeDays: round(Math.max(...ages)),
    fiveRunComplete:
      captures.length === 5 &&
      repetitions.size === 5 &&
      [1, 2, 3, 4, 5].every((item) => repetitions.has(item)),
  };
}

export function summarizeCaptures(
  values: readonly unknown[],
  now = new Date(),
): ModelEvaluationSummary {
  const captures = values.map((value) =>
    parseModelEvaluationCapture(value, now),
  );
  const grouped = new Map<string, ModelEvaluationCapture[]>();
  const noContextRates = new Map<string, number>();
  for (const capture of captures) {
    const group = grouped.get(groupKey(capture)) ?? [];
    group.push(capture);
    grouped.set(groupKey(capture), group);
  }
  for (const group of grouped.values()) {
    const first = group[0];
    if (!first || first.contextMode !== "none") continue;
    noContextRates.set(
      baseKey(first),
      group.filter((capture) => capture.result === "pass").length /
        group.length,
    );
  }
  const groups = [...grouped.values()]
    .map((group) => {
      const first = group[0];
      if (!first) throw new Error("Cannot summarize an empty capture group.");
      return summarizeGroup(
        group,
        now,
        noContextRates.get(baseKey(first)) ?? 0,
      );
    })
    .sort((left, right) =>
      [
        left.taskId,
        left.provider,
        left.model,
        left.contextMode === "none" ? "0" : "1",
      ]
        .join("|")
        .localeCompare(
          [
            right.taskId,
            right.provider,
            right.model,
            right.contextMode === "none" ? "0" : "1",
          ].join("|"),
        ),
    );
  return { schemaVersion: 1, generatedAt: now.toISOString(), groups };
}
