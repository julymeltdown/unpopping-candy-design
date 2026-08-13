import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { parseModelEvaluationCapture } from "../src/index.ts";

const repositoryRoot = new URL("../../../", import.meta.url);

async function runnerSandbox(context: TestContext) {
  const root = await fs.mkdtemp(join(tmpdir(), "popcandy-runner-process-"));
  context.after(async () => fs.rm(root, { force: true, recursive: true }));
  await Promise.all([
    fs.mkdir(join(root, "scripts/lib"), { recursive: true }),
    fs.mkdir(join(root, "packages"), { recursive: true }),
  ]);
  await Promise.all([
    ...[
      "scripts/run-model-evals.mjs",
      "scripts/lib/model-eval-contract.mjs",
      "scripts/lib/model-eval-execution.mjs",
      "scripts/lib/model-eval-reporting.mjs",
    ].map((path) =>
      fs.copyFile(new URL(path, repositoryRoot), join(root, path)),
    ),
    fs.symlink(
      new URL("packages/evals", repositoryRoot),
      join(root, "packages/evals"),
    ),
    fs.symlink(
      new URL("packages/knowledge", repositoryRoot),
      join(root, "packages/knowledge"),
    ),
    fs.symlink(new URL("agent", repositoryRoot), join(root, "agent")),
  ]);
  return root;
}

async function fakeProviderBin(root: string) {
  const bin = join(root, "fake-bin");
  await fs.mkdir(bin);
  const codexEvent = JSON.stringify({
    type: "item.completed",
    item: {
      type: "agent_message",
      text: '{"files":[{"path":"profile.tsx","content":"export const Profile = () => null;"}]}',
    },
  });
  const terminal = JSON.stringify({
    type: "turn.completed",
    usage: { input_tokens: 0, output_tokens: 300 },
  });
  const codex = [
    "#!/bin/sh",
    'printf "%s\\n" "$*" >> "$0.log"',
    'if [ "$1" = "--version" ]; then echo "codex-cli 0.147.0"; exit 0; fi',
    'while IFS= read -r line || [ -n "$line" ]; do :; done',
    'printf "%s\\n" "$OPENAI_API_KEY" >> "$0.credential.log"',
    `printf '%s\\n' '${codexEvent}' '${terminal}'`,
  ].join("\n");
  const claude = [
    "#!/bin/sh",
    'printf "%s\\n" "$*" >> "$0.log"',
    'if [ "$1" = "--version" ]; then echo "2.1.114"; exit 0; fi',
    'while IFS= read -r line || [ -n "$line" ]; do :; done',
    "printf '%s\\n' 'provider-secret c3ludGhldGljLXByb3ZpZGVyLXNlY3JldA==' >&2",
    "exit 97",
  ].join("\n");
  for (const [name, content] of Object.entries({ codex, claude })) {
    const path = join(bin, name);
    await fs.writeFile(path, content);
    await fs.chmod(path, 0o700);
  }
  return bin;
}

type RunOverrides = Readonly<{
  codexModel?: string;
  codexMax?: string;
  worstCase?: string;
}>;

function runArguments(overrides: RunOverrides = {}): readonly string[] {
  return [
    "run",
    "--codex-model",
    overrides.codexModel ?? "gpt-5.3-codex",
    "--claude-model",
    "claude-3-7-sonnet",
    "--codex-max-estimated-usd",
    overrides.codexMax ?? "0.01",
    "--codex-worst-case-usd",
    overrides.worstCase ?? "0.006",
    "--claude-max-budget-usd",
    "0.01",
  ];
}

function runCli(root: string, args: readonly string[], path: string) {
  return spawnSync(
    process.execPath,
    [
      "--experimental-strip-types",
      join(root, "scripts/run-model-evals.mjs"),
      ...args,
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        PATH: path,
        POPCANDY_MODEL_EVAL_APPROVED: "true",
        OPENAI_API_KEY: "synthetic-openai",
        ANTHROPIC_API_KEY: "synthetic-anthropic",
      },
    },
  );
}

test("Codex pricing uses the pinned non-cached token rates", async () => {
  const { estimateCodexUsd } = await import("../src/index.ts");
  assert.equal(
    estimateCodexUsd("gpt-5.3-codex", {
      inputTokens: 1_000_000,
      outputTokens: 1_000_000,
    }),
    15.75,
  );
  assert.throws(
    () =>
      estimateCodexUsd("gpt-9.9-codex", {
        inputTokens: 1,
        outputTokens: 1,
      }),
    /pricing.*gpt-9\.9-codex/i,
  );
});

test("run rejects unsafe Codex inputs before provider preflight", async (context) => {
  const cases: ReadonlyArray<{
    readonly args: readonly string[];
    readonly message: RegExp;
  }> = [
    { args: runArguments({ codexMax: "0" }), message: /positive/ },
    {
      args: runArguments({ worstCase: "0" }),
      message: /worst-case.*positive/i,
    },
    { args: runArguments({ worstCase: "0.02" }), message: /must not exceed/ },
    {
      args: runArguments({ codexModel: "gpt-9.9-codex" }),
      message: /pricing.*gpt-9\.9-codex/i,
    },
    {
      args: [...runArguments(), "--max-estimated-usd", "1"],
      message: /unknown option --max-estimated-usd/i,
    },
  ];
  for (const item of cases) {
    const root = await runnerSandbox(context);
    const bin = await fakeProviderBin(root);
    const result = runCli(root, item.args, bin);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, item.message);
    assert.equal(
      (await fs.readdir(bin)).some((name) => name.endsWith(".log")),
      false,
    );
  }
});

test("run stops before a second paid call when actual Codex cost exceeds its cap", async (context) => {
  const root = await runnerSandbox(context);
  const bin = await fakeProviderBin(root);
  const result = runCli(root, runArguments(), bin);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /actual cost.*worst-case.*exceeds/i);
  const log = await fs.readFile(join(bin, "codex.log"), "utf8");
  assert.equal(log.match(/^exec /gm)?.length, 1);
  const capture = parseModelEvaluationCapture(
    JSON.parse(
      await fs.readFile(
        join(
          root,
          ".artifacts/model-evals/raw/profile-settings/codex/none/1.capture.json",
        ),
        "utf8",
      ),
    ),
  );
  assert.equal(capture.estimatedUsd, 0.0042);
  assert.equal(
    await fs.readFile(join(bin, "codex.credential.log"), "utf8"),
    "synthetic-openai\n",
  );
  assert.match(log, /shell_tool.*unified_exec.*shell_snapshot/);
  assert.match(log, /shell_environment_policy\.inherit=none/);
  assert.match(log, /shell_environment_policy\.ignore_default_excludes=false/);
});

test("provider failures expose only bounded stderr diagnostics", async (context) => {
  const root = await runnerSandbox(context);
  const bin = await fakeProviderBin(root);
  const result = runCli(root, runArguments({ codexMax: "0.05" }), bin);
  const stderr = "provider-secret c3ludGhldGljLXByb3ZpZGVyLXNlY3JldA==\n";
  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    new RegExp(
      `claude exited 97; stderrBytes=${Buffer.byteLength(stderr)}; stderrSha256=${createHash("sha256").update(stderr).digest("hex")}`,
    ),
  );
  assert.doesNotMatch(result.stderr, /provider-secret|c3ludGhldGlj/);
});
