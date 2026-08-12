import { execFile } from "node:child_process";
import {
  copyFile,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { promisify } from "node:util";
import {
  publicPackageFolders,
  publicPackageNames,
} from "./compatibility-contract.mjs";
import {
  createCandidateCompatibility,
  inspectTarballManifest,
} from "./release-candidate-artifacts.mjs";
import {
  sourceHashes,
  stableStringify,
} from "./release-candidate-contract.mjs";

const execFileAsync = promisify(execFile);
const excludedDirectories = new Set([
  ".artifacts",
  ".claude",
  ".codex",
  ".git",
  ".omo",
  ".superpowers",
  ".worktrees",
  "dist",
  "node_modules",
  "storybook-static",
]);

function excludedPath(sourceRoot, source) {
  const path = relative(sourceRoot, source).replaceAll("\\", "/");
  const names = path.split("/");
  return (
    path !== "" &&
    (names.some((name) => excludedDirectories.has(name)) ||
      names.some(
        (name) =>
          [".env", ".netrc", ".npmrc"].includes(name) ||
          name.startsWith(".env.") ||
          name.endsWith(".pem") ||
          name.endsWith(".key"),
      ) ||
      path === ".debug-journal.md")
  );
}

export async function copyCandidateWorkspace(sourceRoot, destinationRoot) {
  const { stdout } = await execFileAsync("git", ["ls-files", "-z"], {
    cwd: sourceRoot,
    maxBuffer: 4 * 1024 * 1024,
  });
  await mkdir(destinationRoot, { recursive: true });
  for (const path of stdout.split("\0").filter(Boolean).sort()) {
    const source = join(sourceRoot, path);
    if (excludedPath(sourceRoot, source)) continue;
    const metadata = await lstat(source);
    if (metadata.isSymbolicLink() || !metadata.isFile()) {
      throw new TypeError(
        `${path}: tracked candidate source must be a regular file.`,
      );
    }
    const destination = join(destinationRoot, path);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
  const ownManifest = join(sourceRoot, ".git");
  try {
    const metadata = await lstat(ownManifest);
    if (metadata.isSymbolicLink()) {
      throw new TypeError("Candidate Git metadata must not be a symlink.");
    }
    if (metadata.isFile()) {
      const destination = join(destinationRoot, ".git");
      await copyFile(ownManifest, destination);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

export async function assertCandidateTarget(request) {
  await mkdir(dirname(request.outputRoot), { recursive: true });
  const releasesRoot = await realpath(dirname(request.outputRoot));
  if (releasesRoot !== dirname(request.outputRoot)) {
    throw new TypeError(
      "Candidate releases directory must not traverse a symlink.",
    );
  }
  try {
    const metadata = await lstat(request.outputRoot);
    if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
      throw new TypeError("Candidate output must be a real directory.");
    }
    if ((await readdir(request.outputRoot)).length) {
      throw new TypeError("Candidate output already exists and is not empty.");
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

export async function assertCoordinatedVersion(root) {
  const names = [];
  for (const folder of publicPackageFolders) {
    const manifest = JSON.parse(
      await readFile(join(root, "packages", folder, "package.json"), "utf8"),
    );
    if (
      manifest.name !== `@unpopping-candy/${folder}` ||
      manifest.version !== "0.3.0"
    ) {
      throw new TypeError(
        "Changesets must produce exactly nine coordinated 0.3.0 packages.",
      );
    }
    names.push(manifest.name);
  }
  if (new Set(names).size !== publicPackageNames.length) {
    throw new TypeError("Changesets produced duplicate public packages.");
  }
}

export async function writeCandidateCompatibility(root, requestedVersion) {
  const compatibility = await createCandidateCompatibility(
    root,
    requestedVersion,
  );
  await writeFile(
    join(root, "agent/manifests/compatibility.json"),
    stableStringify(compatibility),
  );
  await writeFile(
    join(root, "packages/knowledge/src/generated/compatibility.ts"),
    `import type { CompatibilityManifest } from '../types.ts';\n\nexport const bundledCompatibilityManifest = ${JSON.stringify(compatibility, null, 2)} as const satisfies CompatibilityManifest;\n`,
  );
  return compatibility;
}

export async function normalizeCandidateMetadata(root, requestedVersion) {
  for (const folder of [...publicPackageFolders, "evals", "figma"]) {
    const path = join(root, "packages", folder, "package.json");
    const manifest = JSON.parse(await readFile(path, "utf8"));
    if (publicPackageFolders.includes(folder))
      manifest.version = requestedVersion;
    for (const section of [
      "dependencies",
      "devDependencies",
      "peerDependencies",
      "optionalDependencies",
    ]) {
      for (const packageName of publicPackageNames) {
        if (Object.hasOwn(manifest[section] ?? {}, packageName)) {
          manifest[section][packageName] = `workspace:${requestedVersion}`;
        }
      }
    }
    await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  return writeCandidateCompatibility(root, requestedVersion);
}

export async function sourceCommit(root) {
  const { stdout } = await execFileAsync(
    "git",
    ["-C", root, "rev-parse", "HEAD"],
    {
      cwd: root,
      maxBuffer: 64 * 1024,
    },
  );
  if (!/^[0-9a-f]{40}\n?$/.test(stdout)) {
    throw new TypeError("Source commit is not an exact Git SHA.");
  }
  return stdout.trim();
}

export async function assertTrackedSourceClean(root) {
  const { stdout } = await execFileAsync(
    "git",
    ["-C", root, "status", "--porcelain=v1", "--untracked-files=all"],
    { cwd: root, maxBuffer: 1024 * 1024 },
  );
  if (stdout.trim()) {
    throw new TypeError("Candidate source must have no tracked modifications.");
  }
}

export async function assertSourceUnchanged(root, before) {
  const after = await sourceHashes(root);
  if (JSON.stringify(after) !== JSON.stringify(before)) {
    throw new TypeError("Candidate preparation mutated source evidence.");
  }
}

export async function inspectPacked(item, root, run) {
  return inspectTarballManifest(item, root, (options) =>
    run(options.command, options.args, options.cwd, options.timeoutMs),
  );
}
