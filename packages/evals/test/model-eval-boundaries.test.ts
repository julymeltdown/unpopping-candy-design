import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import * as fs from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
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
