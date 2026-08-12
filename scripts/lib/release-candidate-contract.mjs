import { createHash } from "node:crypto";
import {
  lstat,
  readFile,
  readdir,
  realpath,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import {
  publicPackageFolders,
  publicPackageNames,
} from "./compatibility-contract.mjs";

export const privateToolFolders = ["evals", "figma"];
const manifestSections = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
];

function inside(parent, candidate) {
  const path = relative(parent, candidate);
  return path === "" || (!path.startsWith("..") && !isAbsolute(path));
}

function identifier(value) {
  return /^(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)$/.test(value);
}

export function parseExactVersion(version) {
  if (typeof version !== "string") return undefined;
  const match =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/.exec(
      version,
    );
  if (!match) return undefined;
  const prerelease = match[4]?.split(".");
  const build = match[5]?.split(".");
  if (prerelease?.some((part) => !identifier(part))) return undefined;
  if (build?.some((part) => !/^[0-9A-Za-z-]+$/.test(part))) return undefined;
  return { prerelease: Boolean(prerelease) };
}

export function validateCandidateRequest({
  workspaceRoot,
  version,
  channel,
  out,
}) {
  if (typeof workspaceRoot !== "string" || typeof out !== "string") {
    throw new TypeError("Candidate workspace and output paths are required.");
  }
  const source = resolve(workspaceRoot);
  const outputRoot = resolve(out);
  const parsedVersion = parseExactVersion(version);
  if (!parsedVersion) {
    throw new TypeError("Candidate version must be an exact SemVer.");
  }
  if (parsedVersion.prerelease && channel !== "next") {
    throw new TypeError("prerelease candidates require channel next.");
  }
  if (!parsedVersion.prerelease && channel === "next") {
    throw new TypeError("channel next requires a prerelease candidate.");
  }
  if (!new Set(["next", "latest"]).has(channel)) {
    throw new TypeError("Candidate channel must be next or latest.");
  }
  const releasesRoot = join(source, ".artifacts/releases");
  if (dirname(outputRoot) !== releasesRoot) {
    throw new TypeError(
      "Candidate output must be a direct child of .artifacts/releases.",
    );
  }
  return {
    workspaceRoot: source,
    requestedVersion: version,
    channel,
    outputRoot,
  };
}

async function sourcePaths(root) {
  const paths = [
    "pnpm-lock.yaml",
    "agent/manifests/compatibility.json",
    "packages/knowledge/src/generated/compatibility.ts",
  ];
  for (const folder of [...publicPackageFolders, ...privateToolFolders]) {
    paths.push(`packages/${folder}/package.json`);
  }
  for (const name of await readdir(join(root, ".changeset"))) {
    if (name.endsWith(".md")) paths.push(`.changeset/${name}`);
  }
  return paths.sort();
}

export async function sourceHashes(root) {
  const hashes = {};
  for (const path of await sourcePaths(root)) {
    const absolute = join(root, path);
    const metadata = await lstat(absolute);
    if (metadata.isSymbolicLink() || !metadata.isFile()) {
      throw new TypeError(`${path}: source evidence must be a regular file.`);
    }
    hashes[path] = createHash("sha256")
      .update(await readFile(absolute))
      .digest("hex");
  }
  return hashes;
}

function rewriteDependencies(manifest, requestedVersion) {
  for (const section of manifestSections) {
    if (!manifest[section]) continue;
    for (const packageName of publicPackageNames) {
      if (Object.hasOwn(manifest[section], packageName)) {
        manifest[section][packageName] = `workspace:${requestedVersion}`;
      }
    }
  }
}

export async function rewriteCandidateManifests(root, requestedVersion) {
  const seen = [];
  for (const folder of [...publicPackageFolders, ...privateToolFolders]) {
    const path = join(root, "packages", folder, "package.json");
    const manifest = JSON.parse(await readFile(path, "utf8"));
    const expectedName = `@unpopping-candy/${folder}`;
    if (manifest.name !== expectedName) {
      throw new TypeError(`Unexpected package manifest in packages/${folder}.`);
    }
    if (publicPackageNames.includes(manifest.name)) {
      if (manifest.private === true) {
        throw new TypeError(`${manifest.name}: public package is private.`);
      }
      if (manifest.version !== "0.3.0") {
        throw new TypeError(`${manifest.name}: Changesets must produce 0.3.0.`);
      }
      manifest.version = requestedVersion;
      seen.push(manifest.name);
    } else if (manifest.private !== true) {
      throw new TypeError(
        `${manifest.name}: private tool must remain private.`,
      );
    }
    rewriteDependencies(manifest, requestedVersion);
    await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
  }
  const sortedNames = [...seen].sort();
  if (
    sortedNames.length !== publicPackageNames.length ||
    JSON.stringify(sortedNames) !==
      JSON.stringify([...publicPackageNames].sort())
  ) {
    throw new TypeError(
      "Candidate public package set must be exact and unique.",
    );
  }
  return { requestedVersion, publicPackageNames: sortedNames };
}

export function stableStringify(value) {
  const sortValue = (item) => {
    if (Array.isArray(item)) return item.map(sortValue);
    if (item && typeof item === "object") {
      return Object.fromEntries(
        Object.keys(item)
          .sort()
          .map((key) => [key, sortValue(item[key])]),
      );
    }
    return item;
  };
  return `${JSON.stringify(sortValue(value), null, 2)}\n`;
}
