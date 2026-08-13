import { createHash } from "node:crypto";
import { lstat, readFile, readdir, realpath } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { pathIsInside as inside } from "./lib/compatibility-contract.mjs";
import { PUBLIC_PACKAGE_NAMES } from "./lib/public-packages.mjs";
import { verifyPackedReleaseArtifacts } from "./lib/release-candidate-verification.mjs";
import { parseExactVersion } from "./lib/release-candidate-contract.mjs";

function exactKeys(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object.`);
  }
  if (
    JSON.stringify(Object.keys(value).sort()) !==
    JSON.stringify([...keys].sort())
  ) {
    throw new TypeError(`${label} has unknown or missing keys.`);
  }
}

export async function verifyReleaseCandidate(candidateRoot, options = {}) {
  const root = await realpath(resolve(candidateRoot));
  const manifestPath = join(root, "candidate.json");
  const manifestInfo = await lstat(manifestPath);
  if (manifestInfo.isSymbolicLink() || !manifestInfo.isFile()) {
    throw new TypeError("candidate.json must be a regular file.");
  }
  if (manifestInfo.size > 1024 * 1024) {
    throw new TypeError("candidate.json exceeds 1 MiB.");
  }
  const candidate = JSON.parse(await readFile(manifestPath, "utf8"));
  exactKeys(
    candidate,
    [
      "schemaVersion",
      "requestedVersion",
      "channel",
      "sourceCommit",
      "catalogDigest",
      "packages",
      "verification",
    ],
    "Candidate manifest",
  );
  if (
    candidate.schemaVersion !== 1 ||
    candidate.channel !== "next" ||
    !parseExactVersion(candidate.requestedVersion)?.prerelease ||
    !/^[0-9a-f]{40}$/.test(candidate.sourceCommit) ||
    (options.expectedSourceCommit &&
      candidate.sourceCommit !== options.expectedSourceCommit) ||
    !/^[0-9a-f]{64}$/.test(candidate.catalogDigest)
  ) {
    throw new TypeError("Candidate metadata is invalid for the next channel.");
  }
  const catalogPath = join(root, "catalog.json");
  const catalogInfo = await lstat(catalogPath);
  const catalogCanonical = await realpath(catalogPath);
  if (
    catalogInfo.isSymbolicLink() ||
    !catalogInfo.isFile() ||
    catalogInfo.size > 8 * 1024 * 1024 ||
    !inside(root, catalogCanonical)
  ) {
    throw new TypeError("Candidate catalog artifact is unsafe.");
  }
  const catalogBytes = await readFile(catalogCanonical);
  const catalog = JSON.parse(catalogBytes.toString("utf8"));
  if (
    catalog.packageVersion !== candidate.requestedVersion ||
    !Array.isArray(catalog.entries)
  ) {
    throw new TypeError("Candidate catalog artifact is invalid.");
  }
  const catalogDigest = createHash("sha256").update(catalogBytes).digest("hex");
  if (catalogDigest !== candidate.catalogDigest) {
    throw new TypeError("Candidate catalog digest mismatch.");
  }
  if (!Array.isArray(candidate.packages) || candidate.packages.length !== 9) {
    throw new TypeError("Candidate must contain exactly nine packages.");
  }
  const packagesRoot = join(root, "packages");
  const packageEntries = await readdir(packagesRoot, { withFileTypes: true });
  if (
    packageEntries.some(
      (entry) => !entry.isFile() || !entry.name.endsWith(".tgz"),
    ) ||
    JSON.stringify(packageEntries.map(({ name }) => name).sort()) !==
      JSON.stringify(
        candidate.packages.map(({ path }) => basename(path)).sort(),
      )
  ) {
    throw new TypeError("Candidate packages directory must be exact.");
  }
  const names = candidate.packages.map((item) => item.name);
  if (
    new Set(names).size !== PUBLIC_PACKAGE_NAMES.length ||
    JSON.stringify([...names].sort()) !==
      JSON.stringify([...PUBLIC_PACKAGE_NAMES].sort())
  ) {
    throw new TypeError("Candidate package names must be exact and unique.");
  }
  for (const item of candidate.packages) {
    exactKeys(item, ["name", "version", "path", "sha256"], item.name);
    if (
      item.version !== candidate.requestedVersion ||
      !/^packages\/[^/]+\.tgz$/.test(item.path) ||
      !/^[0-9a-f]{64}$/.test(item.sha256)
    ) {
      throw new TypeError(
        `${item.name}: candidate package metadata is invalid.`,
      );
    }
    const path = resolve(root, item.path);
    const info = await lstat(path);
    const canonical = await realpath(path);
    if (
      info.isSymbolicLink() ||
      !info.isFile() ||
      !inside(packagesRoot, canonical) ||
      dirname(path) !== packagesRoot ||
      basename(path) !== basename(item.path)
    ) {
      throw new TypeError(`${item.name}: candidate artifact is unsafe.`);
    }
    const digest = createHash("sha256")
      .update(await readFile(canonical))
      .digest("hex");
    if (digest !== item.sha256) {
      throw new TypeError(`${item.name}: candidate digest mismatch.`);
    }
  }
  await verifyPackedReleaseArtifacts(
    {
      root: packagesRoot,
      tarballs: candidate.packages.map((item) => ({
        packageName: item.name,
        version: item.version,
        name: basename(item.path),
        path: resolve(root, item.path),
        sha256: item.sha256,
      })),
    },
    candidate.requestedVersion,
    options,
  );
  exactKeys(
    candidate.verification,
    [
      "agentCheck",
      "packageTests",
      "typecheck",
      "packageBuild",
      "compatibility",
    ],
    "Candidate verification",
  );
  if (
    [
      candidate.verification.agentCheck,
      candidate.verification.packageTests,
      candidate.verification.typecheck,
      candidate.verification.packageBuild,
    ].some((status) => status !== "passed")
  ) {
    throw new TypeError("Candidate verification gates are incomplete.");
  }
  const compatibility = candidate.verification.compatibility;
  if (
    !Array.isArray(compatibility) ||
    compatibility.length !== 1 ||
    compatibility[0]?.id !== "base/vite-react-19/pnpm-11" ||
    compatibility[0]?.status !== "passed" ||
    compatibility[0]?.resultPath !==
      "compatibility/base/vite-react-19/pnpm-11.json" ||
    !/^[0-9a-f]{64}$/.test(compatibility[0]?.sha256)
  ) {
    throw new TypeError("Candidate compatibility evidence is incomplete.");
  }
  exactKeys(
    compatibility[0],
    ["resultPath", "id", "status", "sha256"],
    "Candidate compatibility evidence",
  );
  const resultPath = resolve(root, compatibility[0].resultPath);
  const resultInfo = await lstat(resultPath);
  const resultCanonical = await realpath(resultPath);
  if (
    resultInfo.isSymbolicLink() ||
    !resultInfo.isFile() ||
    !inside(join(root, "compatibility"), resultCanonical)
  ) {
    throw new TypeError("Candidate compatibility artifact is unsafe.");
  }
  const resultBytes = await readFile(resultCanonical);
  const resultDigest = createHash("sha256").update(resultBytes).digest("hex");
  const result = JSON.parse(resultBytes.toString("utf8"));
  if (
    resultDigest !== compatibility[0].sha256 ||
    result.id !== compatibility[0].id ||
    result.sourceCommit !== candidate.sourceCommit ||
    result.status !== "passed"
  ) {
    throw new TypeError(
      "Candidate compatibility source commit mismatch or artifact is invalid.",
    );
  }
  return candidate;
}

async function main() {
  const values = process.argv.slice(2).filter((argument) => argument !== "--");
  if (
    values.length !== 3 ||
    values[1] !== "--source-commit" ||
    !/^[0-9a-f]{40}$/.test(values[2])
  ) {
    throw new TypeError(
      "Provide one candidate directory and --source-commit <full-sha>.",
    );
  }
  const candidate = await verifyReleaseCandidate(values[0], {
    expectedSourceCommit: values[2],
  });
  process.stdout.write(
    `Verified ${candidate.packages.length} ${candidate.requestedVersion} candidate packages.\n`,
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
