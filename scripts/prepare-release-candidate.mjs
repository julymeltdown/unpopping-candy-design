import { mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  packPublicWorkspace,
  runCompatibilityMatrix,
} from "./run-compatibility-matrix.mjs";
import {
  createCandidateCompatibility,
  inspectTarballManifest,
  packageEvidence,
  sha256File,
  verifyPackedCandidate,
} from "./lib/release-candidate-artifacts.mjs";
import {
  rewriteCandidateManifests,
  sourceHashes,
  stableStringify,
  validateCandidateRequest,
} from "./lib/release-candidate-contract.mjs";
import { runCompatibilityProcess } from "./lib/compatibility-process.mjs";
import { repositoryRoot } from "./lib/project-inspection.mjs";
import {
  assertCandidateTarget,
  assertCoordinatedVersion,
  assertSourceUnchanged,
  assertTrackedSourceClean,
  copyCandidateWorkspace,
  inspectPacked,
  normalizeCandidateMetadata,
  sourceCommit,
} from "./lib/release-candidate-workspace.mjs";

export {
  createCandidateCompatibility,
  rewriteCandidateManifests,
  sourceHashes,
  validateCandidateRequest,
  verifyPackedCandidate,
};

const defaultRoot = repositoryRoot();
const blockedEnvironment =
  /(?:TOKEN|SECRET|PASSWORD|CREDENTIAL|AUTH|COOKIE|KEY)$/i;

function candidateEnvironment() {
  const allowed = [
    "CI",
    "COREPACK_HOME",
    "LANG",
    "LC_ALL",
    "PATH",
    "PNPM_HOME",
    "SOURCE_DATE_EPOCH",
    "SYSTEMROOT",
    "TMPDIR",
    "TEMP",
    "TMP",
  ];
  return Object.fromEntries(
    allowed
      .filter((name) => process.env[name] && !blockedEnvironment.test(name))
      .map((name) => [name, process.env[name]]),
  );
}

async function run(command, args, cwd, timeoutMs = 900_000) {
  return runCompatibilityProcess({
    command,
    args,
    cwd,
    timeoutMs,
    outputLimitBytes: 4 * 1024 * 1024,
    environment: candidateEnvironment(),
  });
}

export async function prepareReleaseCandidate(options) {
  const request = validateCandidateRequest(options);
  await assertCandidateTarget(request);
  await assertTrackedSourceClean(request.workspaceRoot);
  const sourceBefore = await sourceHashes(request.workspaceRoot);
  const commit = await sourceCommit(request.workspaceRoot);
  const workspace = join(request.outputRoot, "workspace");
  const packagesRoot = join(request.outputRoot, "packages");
  let outputCreated = false;
  try {
    await mkdir(request.outputRoot, { recursive: true });
    outputCreated = true;
    await copyCandidateWorkspace(request.workspaceRoot, workspace);
    await run("pnpm", ["install", "--frozen-lockfile"], workspace);
    await run("pnpm", ["version-packages"], workspace);
    await assertCoordinatedVersion(workspace);
    await rewriteCandidateManifests(workspace, request.requestedVersion);
    await run("pnpm", ["install", "--no-frozen-lockfile"], workspace);
    await run("pnpm", ["install", "--frozen-lockfile"], workspace);
    await run("pnpm", ["agent:generate"], workspace);
    const compatibility = await normalizeCandidateMetadata(
      workspace,
      request.requestedVersion,
    );
    await run("pnpm", ["install", "--no-frozen-lockfile"], workspace);
    await run("pnpm", ["install", "--frozen-lockfile"], workspace);
    await run("pnpm", ["agent:check"], workspace);
    await run("pnpm", ["build:packages"], workspace);
    await run("pnpm", ["typecheck"], workspace);
    await run("pnpm", ["test:pure"], workspace);
    const packed = await packPublicWorkspace({
      workspaceRoot: workspace,
      outputRoot: packagesRoot,
      environment: candidateEnvironment(),
    });
    const verified = await verifyPackedCandidate(
      packed,
      request.requestedVersion,
      (item) => inspectPacked(item, packagesRoot, run),
    );
    const compatibilityResult = await runCompatibilityMatrix({
      workspaceRoot: workspace,
      fixture: "base",
      cell: "vite-react-19",
      manager: "pnpm-11",
      packed,
      artifactRoot: join(request.outputRoot, "compatibility"),
      keepPacked: true,
      environment: candidateEnvironment(),
    });
    const packages = await packageEvidence(verified, packagesRoot);
    const candidate = {
      schemaVersion: 1,
      requestedVersion: request.requestedVersion,
      channel: request.channel,
      sourceCommit: commit,
      catalogDigest: compatibility.releases[0].catalogDigest,
      packages,
      verification: {
        agentCheck: "passed",
        pureTests: "passed",
        typecheck: "passed",
        packageBuild: "passed",
        compatibility: await Promise.all(
          compatibilityResult.results.map(async ({ resultPath, result }) => {
            const relativePath = `compatibility/${resultPath}`;
            return {
              resultPath: relativePath,
              id: result.id,
              status: result.status,
              sha256: await sha256File(join(request.outputRoot, relativePath)),
            };
          }),
        ),
      },
    };
    await writeFile(
      join(request.outputRoot, "candidate.json"),
      stableStringify(candidate),
      { flag: "wx" },
    );
    await assertSourceUnchanged(request.workspaceRoot, sourceBefore);
    await assertTrackedSourceClean(request.workspaceRoot);
    return candidate;
  } catch (error) {
    if (outputCreated) {
      await rm(request.outputRoot, { recursive: true, force: true });
    }
    throw error;
  }
}

function parseArguments(argv) {
  const values = argv.filter((argument) => argument !== "--");
  const options = {};
  for (let index = 0; index < values.length; index += 2) {
    const argument = values[index];
    const value = values[index + 1];
    if (!new Set(["--version", "--channel", "--out"]).has(argument)) {
      throw new TypeError(`Unknown release candidate argument: ${argument}.`);
    }
    if (!value || value.startsWith("--")) {
      throw new TypeError(`${argument} requires a value.`);
    }
    const key = argument === "--version" ? "version" : argument.slice(2);
    if (options[key]) throw new TypeError(`${argument} may be provided once.`);
    options[key] = value;
  }
  if (!options.version || !options.channel || !options.out) {
    throw new TypeError("--version, --channel, and --out are required.");
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const candidate = await prepareReleaseCandidate({
    workspaceRoot: defaultRoot,
    ...options,
    out: resolve(defaultRoot, options.out),
  });
  process.stdout.write(
    `Prepared ${candidate.packages.length} ${candidate.requestedVersion} packages for ${candidate.channel}.\n`,
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
