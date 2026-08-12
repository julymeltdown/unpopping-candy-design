import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const runnerPaths =
  "scripts/run-compatibility-matrix.mjs\0scripts/lib/compatibility-consumer.mjs\0scripts/lib/compatibility-contract.mjs\0scripts/lib/compatibility-execution.mjs\0scripts/lib/compatibility-process.mjs".split(
    "\0",
  );

async function gitFile(root, commit, path, encoding = "utf8") {
  const { stdout } = await execFileAsync("git", ["show", `${commit}:${path}`], {
    cwd: root,
    encoding,
    maxBuffer: 1024 * 1024,
    timeout: 5000,
  });
  return stdout;
}

export async function historicalJson(root, commit, path) {
  return JSON.parse(await gitFile(root, commit, path));
}

export async function historicalRunnerDigest(root, commit) {
  const digest = createHash("sha256");
  for (const path of runnerPaths) {
    digest
      .update(`${path}\0`)
      .update(await gitFile(root, commit, path, "buffer"))
      .update("\0");
  }
  return digest.digest("hex");
}
