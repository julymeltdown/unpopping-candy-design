import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { bundledCatalog } from "../../packages/knowledge/src/index.ts";
import * as evals from "../../packages/evals/src/index.ts";
import * as contract from "./model-eval-contract.mjs";

function providerEnvironment(provider) {
  const path = process.env.PATH;
  const name = provider === "codex" ? "OPENAI_API_KEY" : "ANTHROPIC_API_KEY";
  const credential = process.env[name];
  if (!path) throw new Error("PATH is required for provider execution.");
  if (!credential)
    throw new Error(`${name} is required for provider execution.`);
  return { PATH: path, [name]: credential };
}

const providerCli = {
  codex: { name: "@openai/codex", version: "0.147.0" },
  claude: { name: "@anthropic-ai/claude-code", version: "2.1.114" },
};

async function preflightProviders(environments) {
  const task = contract.modelEvaluationTasks[0];
  if (!task) throw new Error("At least one model evaluation task is required.");
  return withEvaluationDirectory(task, "none", async (cwd) => {
    for (const provider of ["codex", "claude"]) {
      const version = runProcess(
        provider,
        ["--version"],
        cwd,
        environments[provider],
        "",
      );
      evals.assertProviderCliVersion(provider, version.trim());
    }
  });
}

function runProcess(command, args, cwd, env, input) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    input,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    timeout: 600_000,
  });
  if (result.error)
    throw new Error(`${command} failed: ${result.error.message}`);
  if (result.status !== 0) {
    throw new Error(
      `${command} exited ${result.status}: ${result.stderr.trim()}`,
    );
  }
  return result.stdout;
}

async function withEvaluationDirectory(task, contextMode, operation) {
  const directory = await fs.mkdtemp(join(tmpdir(), "popcandy-model-eval-"));
  const input = await contract.readModelEvaluationInput(task, contextMode);
  try {
    const files = [
      ["fixture.md", input.fixture],
      ["prompt.md", input.prompt],
      [
        "capture-schema.json",
        `${JSON.stringify(contract.modelOutputSchema, null, 2)}\n`,
      ],
    ];
    if (input.context) files.push(["catalog.json", input.context]);
    for (const [name, content] of files) {
      const path = join(directory, name);
      await fs.writeFile(path, content, { encoding: "utf8", mode: 0o600 });
      await fs.chmod(path, 0o400);
    }
    await fs.chmod(directory, 0o500);
    return await operation(directory, input);
  } finally {
    await fs.chmod(directory, 0o700);
    await fs.rm(directory, { recursive: true, force: true });
  }
}

function makeCapture(run, task, input, parsed, report, estimate) {
  return {
    schemaVersion: 1,
    taskId: run.taskId,
    contextMode: run.contextMode,
    prompt: task.prompt,
    contextDigest: `sha256:${createHash("sha256").update(input.context).digest("hex")}`,
    contextBytes: Buffer.byteLength(input.context),
    rawOutput: parsed.raw,
    provider: run.provider,
    model: run.model,
    providerCli: providerCli[run.provider],
    timestamp: new Date().toISOString(),
    evaluatorVersion: "0.2.0",
    repetition: run.repetition,
    result: report.passed ? "pass" : "fail",
    reason:
      report.findings.map((finding) => finding.code).join(", ") ||
      "deterministic evaluator passed",
    usage: parsed.usage,
    estimatedUsd: estimate,
    evidencePath: `${run.taskId}/${run.provider}/${run.contextMode}/${run.repetition}.${run.provider === "codex" ? "jsonl" : "json"}`,
  };
}

async function persistCapture(run, raw, capture) {
  const relative = `${run.taskId}/${run.provider}/${run.contextMode}/`;
  const directory = new URL(relative, contract.rawCaptureRoot);
  const extension = run.provider === "codex" ? "jsonl" : "json";
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(
    new URL(`${run.repetition}.${extension}`, directory),
    raw,
    { mode: 0o600 },
  );
  await fs.writeFile(
    new URL(`${run.repetition}.capture.json`, directory),
    `${JSON.stringify(capture, null, 2)}\n`,
    { mode: 0o600 },
  );
}

async function executeRun(run, config, codexWorstCaseUsd, environments) {
  const task = contract.modelEvaluationTasks.find(
    ({ id }) => id === run.taskId,
  );
  if (!task) throw new Error(`Unknown task ${run.taskId}.`);
  return withEvaluationDirectory(task, run.contextMode, async (cwd, input) => {
    const env = environments[run.provider];
    const args =
      run.provider === "codex"
        ? evals.buildCodexCommand(run.model)
        : evals.buildClaudeCommand(
            run.model,
            JSON.stringify(contract.modelOutputSchema),
            config.claudeMaxBudgetUsd,
          );
    const raw = runProcess(run.provider, args, cwd, env, input.prompt);
    const parsed =
      run.provider === "codex"
        ? evals.parseCodexJsonl(raw)
        : evals.parseClaudeEnvelope(raw);
    const files = contract.validateGeneratedFiles(JSON.parse(parsed.output));
    const report = evals.evaluateAgentOutput(bundledCatalog, {
      id: `${run.taskId}-${run.provider}-${run.contextMode}-${run.repetition}`,
      mode: run.contextMode === "none" ? "none" : "skill-mcp-storybook",
      task: task.prompt,
      requiredStates: task.requiredStates,
      expectedComponents: task.expectedComponents,
      files,
    });
    const estimate =
      run.provider === "codex" ? codexWorstCaseUsd : config.claudeMaxBudgetUsd;
    const capture = makeCapture(run, task, input, parsed, report, estimate);
    await persistCapture(run, raw, capture);
    return capture;
  });
}

async function readCaptureFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const relative = `${entry.name}${entry.isDirectory() ? "/" : ""}`;
    const path = new URL(relative, directory);
    if (entry.isDirectory()) output.push(...(await readCaptureFiles(path)));
    else if (entry.name.endsWith(".capture.json")) {
      output.push(JSON.parse(await fs.readFile(path, "utf8")));
    }
  }
  return output;
}

export async function runModelEvaluations(config) {
  if (process.env.POPCANDY_MODEL_EVAL_APPROVED !== "true") {
    throw new Error("POPCANDY_MODEL_EVAL_APPROVED=true is required.");
  }
  try {
    await fs.access(contract.rawCaptureRoot);
    throw new Error(
      "Raw model evaluation directory must be empty before a run.",
    );
  } catch (error) {
    const missing =
      error instanceof Error && "code" in error && error.code === "ENOENT";
    if (!missing) throw error;
  }
  const environments = {
    codex: providerEnvironment("codex"),
    claude: providerEnvironment("claude"),
  };
  await preflightProviders(environments);
  const plan = contract.buildModelEvaluationPlan(config);
  const codexRuns = plan.runs.filter((run) => run.provider === "codex").length;
  const worstCase = config.maxEstimatedUsd / codexRuns;
  let accumulated = 0;
  for (const run of plan.runs) {
    if (
      run.provider === "codex" &&
      accumulated + worstCase > config.maxEstimatedUsd + Number.EPSILON
    ) {
      throw new Error(
        "Codex accumulated estimate plus the next worst-case estimate exceeds --max-estimated-usd.",
      );
    }
    const capture = await executeRun(run, config, worstCase, environments);
    if (run.provider === "codex") accumulated += capture.estimatedUsd;
  }
  await fs.writeFile(
    new URL("run-manifest.json", contract.rawCaptureRoot),
    `${JSON.stringify(plan, null, 2)}\n`,
    { mode: 0o600 },
  );
  process.stdout.write(
    `${JSON.stringify({ completed: plan.runs.length, estimatedCodexUsd: accumulated }, null, 2)}\n`,
  );
}

export async function reportModelEvaluations() {
  const manifest = JSON.parse(
    await fs.readFile(
      new URL("run-manifest.json", contract.rawCaptureRoot),
      "utf8",
    ),
  );
  const captures = evals.assertCompleteCaptureSet(
    await readCaptureFiles(contract.rawCaptureRoot),
  );
  contract.validateRunManifest(manifest, captures);
  const summary = evals.summarizeCaptures(captures);
  await fs.mkdir(contract.publicCaptureRoot, { recursive: true });
  await fs.writeFile(
    new URL("captures.json", contract.publicCaptureRoot),
    `${JSON.stringify(captures.map(evals.redactCapture), null, 2)}\n`,
  );
  await fs.writeFile(
    new URL("summary.json", contract.publicCaptureRoot),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  process.stdout.write(
    `${JSON.stringify({ complete: true, captures: captures.length, groups: summary.groups.length }, null, 2)}\n`,
  );
}
