import * as fs from "node:fs/promises";
import { join } from "node:path";
import * as evals from "../../packages/evals/src/index.ts";
import * as contract from "./model-eval-contract.mjs";

async function assertPublicRootAbsent() {
  try {
    await fs.access(contract.publicCaptureRoot);
    throw new Error("Public evidence directory already exists.");
  } catch (error) {
    const missing =
      error instanceof Error && "code" in error && error.code === "ENOENT";
    if (!missing) throw error;
  }
}

async function readCaptureFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const relative = `${entry.name}${entry.isDirectory() ? "/" : ""}`;
    const path = new URL(relative, directory);
    if (entry.isDirectory()) output.push(...(await readCaptureFiles(path)));
    else if (entry.name.endsWith(".capture.json"))
      output.push(JSON.parse(await fs.readFile(path, "utf8")));
  }
  return output;
}

async function promotePublicEvidence(captures, summary) {
  const staging = await fs.mkdtemp(
    new URL(".public-", new URL("../", contract.publicCaptureRoot)),
  );
  try {
    await Promise.all([
      fs.writeFile(
        join(staging, "captures.json"),
        `${JSON.stringify(captures.map(evals.redactCapture), null, 2)}\n`,
      ),
      fs.writeFile(
        join(staging, "summary.json"),
        `${JSON.stringify(summary, null, 2)}\n`,
      ),
    ]);
    await fs.rename(staging, contract.publicCaptureRoot);
  } catch (error) {
    await fs.rm(staging, { force: true, recursive: true });
    throw error;
  }
}

export async function reportModelEvaluations() {
  await assertPublicRootAbsent();
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
  await promotePublicEvidence(captures, summary);
  process.stdout.write(
    `${JSON.stringify({ complete: true, captures: captures.length, groups: summary.groups.length }, null, 2)}\n`,
  );
}
