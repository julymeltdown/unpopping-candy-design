import { readFile } from "node:fs/promises";
import * as evals from "../../packages/evals/src/index.ts";

export const repositoryRoot = new URL("../../", import.meta.url);
const artifactRoot = new URL(".artifacts/model-evals/", repositoryRoot);
export const rawCaptureRoot = new URL("raw/", artifactRoot);
export const publicCaptureRoot = new URL("public/", artifactRoot);
export const modelEvaluationTasks = Object.freeze([
  {
    id: "profile-settings",
    prompt:
      "Build a profile settings form with loading, error, empty, disabled, and pending states.",
    requiredStates: Object.freeze(
      "loading error empty disabled pending".split(" "),
    ),
    expectedComponents: Object.freeze(
      "ui.alert ui.button ui.empty-state ui.stack ui.text-field".split(" "),
    ),
  },
]);
const contextModes = ["none", "popcandy"],
  providers = ["codex", "claude"];
export const modelOutputSchema = Object.freeze({
  type: "object",
  additionalProperties: false,
  required: ["files"],
  properties: {
    files: {
      type: "array",
      minItems: 1,
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "content"],
        properties: {
          path: { type: "string" },
          content: { type: "string" },
        },
      },
    },
  },
});

function fail(message) {
  throw new Error(message);
}

function parseOptions(argv) {
  const options = {};
  for (let index = 1; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === "--") continue;
    if (!key?.startsWith("--")) fail(`Unexpected argument: ${key ?? ""}`);
    const name = key.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--") || name in options) {
      fail(`Option ${key} requires one value.`);
    }
    options[name] = value;
    index += 1;
  }
  return options;
}

function numericOption(options, name) {
  const value = options[name];
  if (typeof value !== "string" || value.trim() === "") {
    fail(`--${name} is required.`);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    fail(`--${name} must be a non-negative number.`);
  }
  return parsed;
}

function planConfiguration(options) {
  const allowed = new Set([
    "codex-model",
    "claude-model",
    "max-estimated-usd",
    "claude-max-budget-usd",
    "repetitions",
  ]);
  for (const name of Object.keys(options)) {
    if (!allowed.has(name)) fail(`Unknown option --${name}.`);
  }
  const codexModel = options["codex-model"];
  const claudeModel = options["claude-model"];
  if (typeof codexModel !== "string") fail("--codex-model is required.");
  if (typeof claudeModel !== "string") fail("--claude-model is required.");
  const claudeMaxBudgetUsd = numericOption(options, "claude-max-budget-usd");
  evals.buildCodexCommand(codexModel);
  evals.buildClaudeCommand(
    claudeModel,
    JSON.stringify(modelOutputSchema),
    claudeMaxBudgetUsd,
  );
  const repetitions =
    options.repetitions === undefined ? 5 : Number(options.repetitions);
  if (repetitions !== 5) fail("--repetitions must be exactly 5.");
  return {
    models: { codex: codexModel, claude: claudeModel },
    maxEstimatedUsd: numericOption(options, "max-estimated-usd"),
    claudeMaxBudgetUsd,
    repetitions,
  };
}

export function parseModelEvaluationCommand(argv) {
  const mode = argv[0];
  if (!["plan", "run", "report"].includes(mode)) {
    fail("Usage: run-model-evals.mjs <plan|run|report>.");
  }
  const options = parseOptions(argv);
  if (mode === "report") {
    if (Object.keys(options).length > 0)
      fail("evals:report accepts no options.");
    return { mode };
  }
  return { mode, config: planConfiguration(options) };
}

export function buildModelEvaluationPlan(config) {
  const runs = [];
  for (const task of modelEvaluationTasks) {
    for (const provider of providers) {
      for (const contextMode of contextModes) {
        for (
          let repetition = 1;
          repetition <= config.repetitions;
          repetition += 1
        ) {
          runs.push({
            taskId: task.id,
            provider,
            model: config.models[provider],
            contextMode,
            repetition,
          });
        }
      }
    }
  }
  return { schemaVersion: 1, tasks: modelEvaluationTasks.length, runs };
}

export async function readModelEvaluationInput(task, contextMode) {
  const fixture = await readFile(
    new URL("packages/evals/fixtures/README.md", repositoryRoot),
    "utf8",
  );
  const context =
    contextMode === "popcandy"
      ? await readFile(
          new URL("agent/manifests/catalog.json", repositoryRoot),
          "utf8",
        )
      : "";
  if (Buffer.byteLength(context) > 131_072) {
    fail("Bounded catalog context exceeds 131072 bytes.");
  }
  const prompt = [
    task.prompt,
    `Return JSON matching capture-schema.json. Public fixture:\n${fixture}`,
    context
      ? `Bounded public catalog:\n${context}`
      : "No Unpopping Candy context is provided.",
  ].join("\n\n");
  return { fixture, context, prompt };
}

export function validateGeneratedFiles(value) {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !Array.isArray(value.files)
  )
    throw new Error("Provider structured output requires a files array.");
  return value.files.map((file) => {
    if (typeof file !== "object" || file === null || Array.isArray(file)) {
      throw new Error("Generated file must be an object.");
    }
    if (
      typeof file.path !== "string" ||
      !/^[A-Za-z0-9._/-]+$/.test(file.path) ||
      file.path.startsWith("/") ||
      file.path.includes("..")
    )
      throw new Error("Generated file path must be safe and relative.");
    if (typeof file.content !== "string" || file.content.length > 500_000) {
      throw new Error("Generated file content is invalid.");
    }
    return { path: file.path, content: file.content };
  });
}

export function validateRunManifest(manifest, captures) {
  if (
    typeof manifest !== "object" ||
    manifest === null ||
    Array.isArray(manifest) ||
    manifest.schemaVersion !== 1 ||
    !Number.isSafeInteger(manifest.tasks) ||
    !Array.isArray(manifest.runs) ||
    manifest.runs.length !== captures.length
  ) {
    throw new Error(
      "Raw captures must exactly match one complete run manifest.",
    );
  }
  const key = (item) => {
    if (
      typeof item !== "object" ||
      item === null ||
      Array.isArray(item) ||
      typeof item.taskId !== "string" ||
      typeof item.model !== "string" ||
      !providers.includes(item.provider) ||
      !contextModes.includes(item.contextMode) ||
      !Number.isSafeInteger(item.repetition)
    )
      throw new Error("Run manifest contains an invalid run.");
    return [
      item.taskId,
      item.provider,
      item.model,
      item.contextMode,
      item.repetition,
    ].join("|");
  };
  const expected = new Set(manifest.runs.map(key));
  if (expected.size !== manifest.runs.length) {
    throw new Error("Run manifest must not contain duplicate runs.");
  }
  if (
    manifest.tasks !== new Set(manifest.runs.map(({ taskId }) => taskId)).size
  ) {
    throw new Error("Run manifest task count is invalid.");
  }
  for (const capture of captures) {
    if (!expected.delete(key(capture))) {
      throw new Error("Raw capture is not declared by the run manifest.");
    }
  }
  if (expected.size > 0)
    throw new Error("Run manifest has missing raw captures.");
}
