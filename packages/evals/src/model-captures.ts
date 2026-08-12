import type {
  ModelEvaluationCapture,
  ModelEvaluationProvider,
} from "./types.ts";

const MAX_CAPTURE_AGE_MS = 30 * 86_400_000;
const MAX_CONTEXT_BYTES = 131_072;
const captureKeys =
  "schemaVersion taskId contextMode prompt contextDigest contextBytes rawOutput provider model providerCli timestamp evaluatorVersion repetition result reason usage estimatedUsd evidencePath".split(
    " ",
  );

const providerCli = {
  codex: { name: "@openai/codex", version: "0.147.0" },
  claude: { name: "@anthropic-ai/claude-code", version: "2.1.114" },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  keys: readonly string[],
): boolean {
  const actual = Object.keys(value).sort();
  return (
    actual.length === keys.length && actual.every((key) => keys.includes(key))
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isFullModelId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-z0-9][a-z0-9._-]*-[a-z0-9][a-z0-9._-]*$/i.test(value) &&
    value !== "codex-latest" &&
    value !== "claude-latest"
  );
}

function isRelativeEvidencePath(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.startsWith("/") &&
    !/^[A-Za-z]:[\\/]/.test(value) &&
    !value.includes("\\") &&
    !value.includes("//") &&
    !/(^|\/)\.{1,2}(\/|$)/.test(value)
  );
}

function schemaShapeIsValid(value: Record<string, unknown>): boolean {
  const cli = value.providerCli;
  const usage = value.usage;
  return (
    hasExactKeys(value, captureKeys) &&
    isRecord(cli) &&
    hasExactKeys(cli, ["name", "version"]) &&
    isRecord(usage) &&
    hasExactKeys(usage, ["inputTokens", "outputTokens"])
  );
}

function captureFieldsAreValid(
  value: unknown,
): value is ModelEvaluationCapture {
  if (
    !isRecord(value) ||
    !schemaShapeIsValid(value) ||
    (value.provider !== "codex" && value.provider !== "claude")
  )
    return false;
  const expectedCli = providerCli[value.provider];
  const cli = value.providerCli;
  const usage = value.usage;
  if (!isRecord(cli) || !isRecord(usage)) return false;
  return (
    value.schemaVersion === 1 &&
    /^[a-z0-9][a-z0-9._-]*$/i.test(
      typeof value.taskId === "string" ? value.taskId : "",
    ) &&
    (value.contextMode === "none" || value.contextMode === "popcandy") &&
    isNonEmptyString(value.prompt) &&
    value.prompt.length <= 20_000 &&
    typeof value.contextDigest === "string" &&
    /^sha256:[a-f0-9]{64}$/.test(value.contextDigest) &&
    isNonNegativeInteger(value.contextBytes) &&
    value.contextBytes <= MAX_CONTEXT_BYTES &&
    ((value.contextMode === "none" && value.contextBytes === 0) ||
      (value.contextMode === "popcandy" && value.contextBytes > 0)) &&
    isNonEmptyString(value.rawOutput) &&
    value.rawOutput.length <= 5_000_000 &&
    isFullModelId(value.model) &&
    cli.name === expectedCli.name &&
    cli.version === expectedCli.version &&
    isNonEmptyString(value.timestamp) &&
    typeof value.evaluatorVersion === "string" &&
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(value.evaluatorVersion) &&
    isNonNegativeInteger(value.repetition) &&
    value.repetition >= 1 &&
    value.repetition <= 5 &&
    (value.result === "pass" || value.result === "fail") &&
    isNonEmptyString(value.reason) &&
    isNonNegativeInteger(usage.inputTokens) &&
    isNonNegativeInteger(usage.outputTokens) &&
    typeof value.estimatedUsd === "number" &&
    Number.isFinite(value.estimatedUsd) &&
    value.estimatedUsd >= 0 &&
    isRelativeEvidencePath(value.evidencePath)
  );
}

function validationMessage(value: unknown): string {
  if (!isRecord(value)) return "Capture must be an object.";
  if (!("rawOutput" in value)) return "Capture rawOutput is required.";
  if (!isFullModelId(value.model))
    return "Capture requires an explicit full model ID.";
  if (
    (value.provider === "codex" || value.provider === "claude") &&
    isRecord(value.providerCli)
  ) {
    const expected = providerCli[value.provider];
    if (
      value.providerCli.name !== expected.name ||
      value.providerCli.version !== expected.version
    ) {
      return `Capture requires ${expected.name} ${expected.version}.`;
    }
  }
  if (!isRelativeEvidencePath(value.evidencePath))
    return "Capture evidencePath must be relative.";
  return "Capture does not match ModelEvaluationCapture schema version 1.";
}

export function parseModelEvaluationCapture(
  value: unknown,
  now = new Date(),
): ModelEvaluationCapture {
  if (!captureFieldsAreValid(value)) throw new Error(validationMessage(value));
  const timestamp = new Date(value.timestamp);
  if (
    !Number.isFinite(timestamp.getTime()) ||
    timestamp.toISOString() !== value.timestamp
  ) {
    throw new Error("Capture timestamp must be an ISO-8601 instant.");
  }
  const age = now.getTime() - timestamp.getTime();
  if (age < 0) throw new Error("Capture timestamp cannot be in the future.");
  if (age > MAX_CAPTURE_AGE_MS)
    throw new Error("Capture must be no older than 30 days.");
  return value;
}

function groupKey(capture: ModelEvaluationCapture): string {
  return `${capture.taskId}|${capture.provider}|${capture.model}|${capture.contextMode}`;
}

export function assertCompleteCaptureSet(
  values: readonly unknown[],
  now = new Date(),
): readonly ModelEvaluationCapture[] {
  const captures = values.map((value) =>
    parseModelEvaluationCapture(value, now),
  );
  const groups = new Map<string, number[]>();
  for (const capture of captures) {
    const repetitions = groups.get(groupKey(capture)) ?? [];
    repetitions.push(capture.repetition);
    groups.set(groupKey(capture), repetitions);
  }
  if (groups.size === 0)
    throw new Error("Capture set must contain five repetitions per group.");
  for (const repetitions of groups.values()) {
    if (new Set(repetitions).size !== repetitions.length) {
      throw new Error("Each group requires five unique repetition values.");
    }
    if (
      repetitions.length !== 5 ||
      ![1, 2, 3, 4, 5].every((item) => repetitions.includes(item))
    ) {
      throw new Error(
        "Each group requires five repetitions numbered 1 through 5.",
      );
    }
  }
  const taskProviders = new Map<string, Set<ModelEvaluationProvider>>();
  for (const capture of captures) {
    const providers = taskProviders.get(capture.taskId) ?? new Set();
    providers.add(capture.provider);
    taskProviders.set(capture.taskId, providers);
    const otherMode = capture.contextMode === "none" ? "popcandy" : "none";
    if (
      !groups.has(
        `${capture.taskId}|${capture.provider}|${capture.model}|${otherMode}`,
      )
    ) {
      throw new Error("Each model requires both context modes.");
    }
  }
  for (const providers of taskProviders.values()) {
    if (providers.size !== 2)
      throw new Error("Each task requires both providers.");
  }
  return captures;
}

function redactText(value: string): string {
  return value
    .replace(
      /\\"(?:OPENAI_API_KEY|ANTHROPIC_API_KEY)\\"\s*[:=]\s*\\"[^\\"\r\n]*\\"/gi,
      "[REDACTED_SECRET]",
    )
    .replace(
      /["']?(?:OPENAI_API_KEY|ANTHROPIC_API_KEY)["']?\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,}\]]+)/gi,
      "[REDACTED_SECRET]",
    )
    .replace(/\bBearer\s+[A-Za-z0-9._-]{16,}/gi, "[REDACTED_SECRET]")
    .replace(
      /\b(?:sk-(?:proj-|ant-api\d{2}-)?|gh[pousr]_)[A-Za-z0-9_-]{16,}\b/g,
      "[REDACTED_SECRET]",
    )
    .replace(
      /\/(?:Users|home)\/[^\s"'\\]+(?:\/[^\s"'\\]+)*/g,
      "[REDACTED_USER_PATH]",
    )
    .replace(
      /[A-Za-z]:\\Users\\[^\s"']+(?:\\[^\s"']+)*/g,
      "[REDACTED_USER_PATH]",
    );
}

export function redactCapture(
  capture: ModelEvaluationCapture,
): ModelEvaluationCapture {
  return {
    ...capture,
    taskId: redactText(capture.taskId),
    prompt: redactText(capture.prompt),
    rawOutput: redactText(capture.rawOutput),
    model: redactText(capture.model),
    reason: redactText(capture.reason),
    evidencePath: redactText(capture.evidencePath),
  };
}
