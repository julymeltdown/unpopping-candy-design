import type {
  ModelEvaluationProvider,
  ProviderCaptureOutput,
} from "./types.ts";

export const providerCliVersions = {
  codex: "0.147.0",
  claude: "2.1.114",
} satisfies Readonly<Record<ModelEvaluationProvider, string>>;

export const codexPricingSnapshot = Object.freeze({
  effectiveDate: "2026-08-12",
  source: "https://developers.openai.com/api/docs/models/gpt-5.3-codex",
  models: Object.freeze({
    "gpt-5.3-codex": Object.freeze({
      inputUsdPerMillionTokens: 1.75,
      outputUsdPerMillionTokens: 14,
    }),
  }),
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJson(value: string, label: string): unknown {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed;
  } catch {
    throw new Error(`${label} is not valid JSON.`);
  }
}

function tokenUsage(
  value: unknown,
  label: string,
): { inputTokens: number; outputTokens: number } {
  if (!isRecord(value)) throw new Error(`${label} usage is required.`);
  const input = value.input_tokens;
  const output = value.output_tokens;
  if (
    typeof input !== "number" ||
    !Number.isSafeInteger(input) ||
    input < 0 ||
    typeof output !== "number" ||
    !Number.isSafeInteger(output) ||
    output < 0
  ) {
    throw new Error(
      `${label} usage requires non-negative input_tokens and output_tokens.`,
    );
  }
  return { inputTokens: input, outputTokens: output };
}

export function parseCodexJsonl(raw: string): ProviderCaptureOutput {
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) throw new Error("Codex JSONL stream is empty.");
  let output = "";
  let terminalUsage: { inputTokens: number; outputTokens: number } | undefined;
  let terminalEvents = 0;
  let terminalIndex = -1;
  let messageIndex = -1;
  for (const [index, line] of lines.entries()) {
    const event = parseJson(line, "Codex JSONL event");
    if (!isRecord(event))
      throw new Error("Codex JSONL event must be an object.");
    if (event.type === "item.completed" && isRecord(event.item)) {
      if (
        event.item.type === "agent_message" &&
        typeof event.item.text === "string"
      ) {
        output = event.item.text;
        messageIndex = index;
      }
    }
    if (event.type === "turn.completed") {
      terminalEvents += 1;
      terminalIndex = index;
      terminalUsage = tokenUsage(event.usage, "Codex terminal");
    }
  }
  if (terminalEvents !== 1) {
    throw new Error("Codex stream requires exactly one terminal event.");
  }
  if (terminalIndex !== lines.length - 1) {
    throw new Error("Codex terminal event must be the final event.");
  }
  if (!output) throw new Error("Codex stream has no completed agent message.");
  if (messageIndex >= terminalIndex) {
    throw new Error(
      "Codex final agent message must precede its terminal event.",
    );
  }
  if (!terminalUsage)
    throw new Error("Codex stream has no terminal usage event.");
  return { output, usage: terminalUsage, raw };
}

function codexPricing(model: string) {
  if (model === "gpt-5.3-codex") {
    return codexPricingSnapshot.models["gpt-5.3-codex"];
  }
  throw new Error(`Codex pricing is unavailable for ${model}.`);
}

export function assertCodexModelPricing(model: string): void {
  codexPricing(model);
}

export function estimateCodexUsd(
  model: string,
  usage: { readonly inputTokens: number; readonly outputTokens: number },
): number {
  if (
    !Number.isSafeInteger(usage.inputTokens) ||
    usage.inputTokens < 0 ||
    !Number.isSafeInteger(usage.outputTokens) ||
    usage.outputTokens < 0
  ) {
    throw new Error("Codex pricing requires non-negative integer token usage.");
  }
  const pricing = codexPricing(model);
  const usd =
    (usage.inputTokens * pricing.inputUsdPerMillionTokens +
      usage.outputTokens * pricing.outputUsdPerMillionTokens) /
    1_000_000;
  return Math.ceil(usd * 100_000_000) / 100_000_000;
}

export function parseClaudeEnvelope(raw: string): ProviderCaptureOutput {
  const envelope = parseJson(raw, "Claude result envelope");
  if (!isRecord(envelope))
    throw new Error("Claude result envelope must be an object.");
  if (envelope.type !== "result") {
    throw new Error("Claude output must be one type=result envelope.");
  }
  if (!isRecord(envelope.structured_output)) {
    throw new Error("Claude result envelope structured_output is required.");
  }
  return {
    output: JSON.stringify(envelope.structured_output),
    usage: tokenUsage(envelope.usage, "Claude envelope"),
    raw,
  };
}

function requireFullModelId(model: string): void {
  if (!/^[a-z0-9][a-z0-9._-]*-[a-z0-9][a-z0-9._-]*$/i.test(model)) {
    throw new Error("Provider command requires an explicit full model ID.");
  }
}

export function assertProviderCliVersion(
  provider: ModelEvaluationProvider,
  output: string,
): void {
  const expected = providerCliVersions[provider];
  const versions = output.match(/\d+\.\d+\.\d+/g) ?? [];
  if (versions.length !== 1 || versions[0] !== expected) {
    throw new Error(`${provider} CLI must be version ${expected}.`);
  }
}

export function buildCodexCommand(model: string): readonly string[] {
  requireFullModelId(model);
  return [
    "exec",
    "--ignore-user-config",
    "--strict-config",
    "--disable",
    "shell_tool",
    "--disable",
    "unified_exec",
    "--disable",
    "shell_snapshot",
    "-c",
    "shell_environment_policy.inherit=none",
    "-c",
    "shell_environment_policy.experimental_use_profile=false",
    "-c",
    "shell_environment_policy.ignore_default_excludes=false",
    "--ephemeral",
    "--sandbox",
    "read-only",
    "--model",
    model,
    "--json",
    "--output-schema",
    "capture-schema.json",
    "-",
  ];
}

export function buildClaudeCommand(
  model: string,
  schemaJson: string,
  maxBudgetUsd: number,
): readonly string[] {
  requireFullModelId(model);
  if (!Number.isFinite(maxBudgetUsd) || maxBudgetUsd < 0) {
    throw new Error("Claude maximum budget must be a non-negative number.");
  }
  const parsedSchema = parseJson(schemaJson, "Claude JSON schema");
  if (!isRecord(parsedSchema))
    throw new Error("Claude JSON schema must be an object.");
  return [
    "--bare",
    "--print",
    "--tools",
    "",
    "--model",
    model,
    "--output-format",
    "json",
    "--json-schema",
    schemaJson,
    "--max-budget-usd",
    String(maxBudgetUsd),
    "--no-session-persistence",
    "--permission-mode",
    "plan",
  ];
}
