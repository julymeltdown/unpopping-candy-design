import { rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  createCompatibilityPlan,
  parseCompatibilityArguments,
  readCompatibilityMatrix,
} from "./lib/compatibility-contract.mjs";
import { executeCompatibilityRun } from "./lib/compatibility-execution.mjs";
import {
  createPackedWorkspace,
  validatePackedWorkspace,
} from "./lib/compatibility-process.mjs";

const defaultWorkspaceRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

export async function packPublicWorkspace(options = {}) {
  return createPackedWorkspace({
    workspaceRoot: resolve(options.workspaceRoot ?? defaultWorkspaceRoot),
    outputRoot: options.outputRoot,
  });
}

export async function runCompatibilityMatrix(options = {}) {
  const workspaceRoot = resolve(options.workspaceRoot ?? defaultWorkspaceRoot);
  const matrix = await readCompatibilityMatrix(workspaceRoot);
  const runs = createCompatibilityPlan(matrix, options);
  if (options.plan) return { runs };

  const candidatePacked =
    options.packed ?? (await packPublicWorkspace({ workspaceRoot }));
  try {
    const packed = await validatePackedWorkspace(candidatePacked);
    const artifactRoot = resolve(
      options.artifactRoot ?? join(workspaceRoot, ".artifacts/compatibility"),
    );
    const results = [];
    for (const run of runs) {
      results.push(
        await executeCompatibilityRun(
          {
            workspaceRoot,
            artifactRoot,
            matrix,
            packed,
            keepTemporary: options.keepTemporary === true,
          },
          run,
        ),
      );
    }
    return { runs, results };
  } finally {
    if (!options.packed && !options.keepPacked) {
      await rm(candidatePacked.root, { recursive: true, force: true });
    }
  }
}

async function main() {
  const result = await runCompatibilityMatrix({
    ...parseCompatibilityArguments(process.argv.slice(2)),
    workspaceRoot: defaultWorkspaceRoot,
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(resolve(entry)).href) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
