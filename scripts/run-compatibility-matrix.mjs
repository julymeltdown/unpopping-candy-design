import { execFile } from "node:child_process";
import { rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import {
  createCompatibilityPlan,
  parseCompatibilityArguments,
  readCompatibilityMatrix,
} from "./lib/compatibility-contract.mjs";
import { executeCompatibilityRun } from "./lib/compatibility-execution.mjs";
import {
  createCompatibilityEnvironment,
  withCompatibilityRunCache,
} from "./lib/compatibility-environment.mjs";
import {
  createPackedWorkspace,
  validatePackedWorkspace,
} from "./lib/compatibility-process.mjs";

const defaultWorkspaceRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);
const execFileAsync = promisify(execFile);

async function readSourceCommit(workspaceRoot) {
  const { stdout } = await execFileAsync("git", ["rev-parse", "HEAD"], {
    cwd: workspaceRoot,
    env: createCompatibilityEnvironment(),
    maxBuffer: 64 * 1024,
  });
  const sourceCommit = stdout.trim();
  if (!/^[0-9a-f]{40}$/.test(sourceCommit)) {
    throw new TypeError("Compatibility source commit must be a full Git SHA.");
  }
  return sourceCommit;
}

export async function packPublicWorkspace(options = {}) {
  return createPackedWorkspace({
    workspaceRoot: resolve(options.workspaceRoot ?? defaultWorkspaceRoot),
    outputRoot: options.outputRoot,
    environment: options.environment,
  });
}

export async function runCompatibilityMatrix(options = {}) {
  const workspaceRoot = resolve(options.workspaceRoot ?? defaultWorkspaceRoot);
  const matrix = await readCompatibilityMatrix(workspaceRoot);
  const runs = createCompatibilityPlan(matrix, options);
  if (options.plan) return { runs };
  const sourceCommit =
    options.sourceCommit ?? (await readSourceCommit(workspaceRoot));
  if (!/^[0-9a-f]{40}$/.test(sourceCommit)) {
    throw new TypeError("Compatibility source commit must be a full Git SHA.");
  }

  const execute = async (cacheRoot) => {
    let candidatePacked;
    try {
      candidatePacked =
        options.packed ?? (await packPublicWorkspace({ workspaceRoot }));
      const packed = await validatePackedWorkspace(
        candidatePacked,
        options.environment,
      );
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
              environment: options.environment,
              cacheRoot,
              sourceCommit,
            },
            run,
          ),
        );
      }
      return { runs, results };
    } finally {
      if (candidatePacked && !options.packed && !options.keepPacked) {
        await rm(candidatePacked.root, { recursive: true, force: true });
      }
    }
  };
  return options.cacheRoot
    ? execute(resolve(options.cacheRoot))
    : withCompatibilityRunCache(execute);
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
