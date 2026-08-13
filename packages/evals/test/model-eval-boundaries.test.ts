import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { parseModelEvaluationCapture } from "../src/index.ts";
const repositoryRoot = new URL("../../../", import.meta.url);

async function runnerSandbox(context: TestContext) {
  const root = await fs.mkdtemp(join(tmpdir(), "popcandy-runner-boundary-"));
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
    'printf "%s\\n" "$OPENAI_API_KEY" >> "$0.credential.log"',
    `printf '%s\\n' '${codexEvent}' '${terminal}'`,
  ].join("\n");
  const claude = [
    "#!/bin/sh",
    'printf "%s\\n" "$*" >> "$0.log"',
    'if [ "$1" = "--version" ]; then echo "2.1.114"; exit 0; fi',
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
  total?: string;
  worstCase?: string;
}>;

function runArguments(overrides: RunOverrides = {}): readonly string[] {
  return [
    "run",
    "--codex-model",
    overrides.codexModel ?? "gpt-5.3-codex",
    "--claude-model",
    "claude-3-7-sonnet",
    "--max-estimated-usd",
    overrides.total ?? "0.01",
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
    { args: runArguments({ total: "0" }), message: /positive/ },
    {
      args: runArguments({ worstCase: "0" }),
      message: /worst-case.*positive/i,
    },
    { args: runArguments({ worstCase: "0.02" }), message: /must not exceed/ },
    {
      args: runArguments({ codexModel: "gpt-9.9-codex" }),
      message: /pricing.*gpt-9\.9-codex/i,
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

test("run stops before a second paid call when actual cost plus worst case exceeds cap", async (context) => {
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

test("report refuses stale public evidence without mixing new files", async (context) => {
  const root = await runnerSandbox(context);
  const publicRoot = join(root, ".artifacts/model-evals/public");
  await fs.mkdir(publicRoot, { recursive: true });
  await fs.writeFile(join(publicRoot, "stale.txt"), "stale");
  const result = runCli(root, ["report"], "unused");
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /public.*already exists/i);
  assert.deepEqual(await fs.readdir(publicRoot), ["stale.txt"]);
});

test("report leaves no public output when raw evidence is invalid", async (context) => {
  const root = await runnerSandbox(context);
  const publicRoot = join(root, ".artifacts/model-evals/public");
  const result = runCli(root, ["report"], "unused");
  assert.notEqual(result.status, 0);
  await assert.rejects(fs.access(publicRoot), /ENOENT/);
});

async function workflowSandbox(context: TestContext): Promise<string> {
  const root = await fs.mkdtemp(join(tmpdir(), "popcandy-workflow-boundary-"));
  context.after(async () => fs.rm(root, { force: true, recursive: true }));
  const bin = join(root, "bin");
  await fs.mkdir(join(root, ".artifacts/model-evals/raw"), { recursive: true });
  await fs.mkdir(bin);
  const scripts = {
    tar: '#!/bin/sh\nprintf called > "$0.called"\nprintf archive\n',
    openssl:
      '#!/bin/sh\nprintf called > "$0.called"\nwhile [ "$#" -gt 0 ]; do [ "$1" = "-out" ] && { : > "$2"; exit 0; }; shift; done\nexit 2\n',
  };
  for (const [name, content] of Object.entries(scripts)) {
    await fs.writeFile(join(bin, name), content);
  }
  for (const name of Object.keys(scripts))
    await fs.chmod(join(bin, name), 0o700);
  return root;
}
async function runEncryptionStep(context: TestContext, secret: string) {
  const root = await workflowSandbox(context);
  const workflow = await fs.readFile(
    new URL(".github/workflows/model-evals.yml", repositoryRoot),
    "utf8",
  );
  const start = workflow.indexOf("- name: Encrypt restricted raw evidence");
  const section = workflow.slice(start);
  const match = section.match(/        run: \|\n((?: {10}.*(?:\n|$))+)/);
  const body = match?.[1];
  assert.ok(body);
  const result = spawnSync(
    "/bin/bash",
    ["-euo", "pipefail", "-c", body.replace(/^ {10}/gm, "")],
    {
      cwd: root,
      env: { PATH: join(root, "bin"), POPCANDY_RAW_EVIDENCE_KEY: secret },
    },
  );
  return { root, status: result.status };
}
test("workflow refuses an empty encryption secret before archiving", async (context) => {
  const { root, status } = await runEncryptionStep(context, "");
  assert.notEqual(status, 0);
  assert.deepEqual(await fs.readdir(join(root, "bin")), ["openssl", "tar"]);
});
test("workflow refuses an empty encrypted artifact", async (context) => {
  const { status } = await runEncryptionStep(context, "synthetic");
  assert.notEqual(status, 0);
});
