import { execFile } from "node:child_process";
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { gzipSync } from "node:zlib";
import {
  assertWithinBudgets,
  BUNDLE_POLICY,
  packageFolders,
  resolveBudgetMode,
  validateBundlePolicy,
} from "./lib/bundle-policy.mjs";
import { repositoryRoot } from "./lib/project-inspection.mjs";

export {
  assertWithinBudgets,
  BUNDLE_POLICY,
  resolveBudgetMode,
  validateBundlePolicy,
};

const execFileAsync = promisify(execFile);
const root = repositoryRoot();

function inside(parent, candidate) {
  const path = relative(parent, candidate);
  return path === "" || (!path.startsWith("..") && !isAbsolute(path));
}

function eligible(path) {
  return (
    /\.(?:js|css|json)$/.test(path) &&
    !/(?:^|\/)(?:test|tests|__tests__)(?:\/|$)/.test(path) &&
    !/\.(?:test|spec)\.(?:js|json)$/.test(path) &&
    !/\.map$/.test(path)
  );
}

export async function measurePackageDirectory(packageRoot) {
  const canonicalPackage = await realpath(packageRoot);
  const dist = join(canonicalPackage, "dist");
  const distInfo = await lstat(dist);
  if (distInfo.isSymbolicLink() || !distInfo.isDirectory())
    throw new TypeError(`${dist}: build output must be a real directory.`);
  const canonicalDist = await realpath(dist);
  if (!inside(canonicalPackage, canonicalDist))
    throw new TypeError(`${dist}: build output escapes its package.`);
  const files = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink())
        throw new TypeError(
          `${path}: symbolic link is not allowed in build output.`,
        );
      if (entry.isDirectory()) await walk(path);
      else if (
        entry.isFile() &&
        eligible(relative(canonicalDist, path).replaceAll("\\", "/"))
      ) {
        const canonical = await realpath(path);
        if (!inside(canonicalDist, canonical))
          throw new TypeError(`${path}: artifact escapes build output.`);
        files.push({
          path: relative(canonicalDist, path).replaceAll("\\", "/"),
          bytes: gzipSync(await readFile(canonical), { level: 9 }).length,
        });
      }
    }
  }
  await walk(canonicalDist);
  files.sort((left, right) => left.path.localeCompare(right.path));
  if (!files.length)
    throw new TypeError(`${dist}: no measurable build artifacts.`);
  return { bytes: files.reduce((sum, file) => sum + file.bytes, 0), files };
}

function catalogEntries(value, label) {
  if (!value || !Array.isArray(value.entries))
    throw new TypeError(`${label} catalog is malformed.`);
  const entries = new Map();
  for (const entry of value.entries) {
    if (!entry || typeof entry.id !== "string" || entries.has(entry.id))
      throw new TypeError(`${label} catalog IDs must be exact and unique.`);
    entries.set(entry.id, JSON.stringify(entry));
  }
  return entries;
}

async function catalogChanges(ref) {
  if (!ref || ref.startsWith("-") || /[\u0000-\u001f]/.test(ref))
    throw new TypeError("Invalid --changed-from revision.");
  const { stdout: commit } = await execFileAsync(
    "git",
    ["rev-parse", "--verify", `${ref}^{commit}`],
    { cwd: root },
  );
  const { stdout: beforeSource } = await execFileAsync(
    "git",
    ["show", `${commit.trim()}:agent/manifests/catalog.json`],
    { cwd: root, maxBuffer: 8 * 1024 * 1024 },
  );
  const before = catalogEntries(JSON.parse(beforeSource), "Historical");
  const current = catalogEntries(
    JSON.parse(
      await readFile(join(root, "agent/manifests/catalog.json"), "utf8"),
    ),
    "Current",
  );
  return {
    addedCatalogIds: [...current.keys()].filter((id) => !before.has(id)),
    changedCatalogIds: [...current.keys()].filter(
      (id) => before.has(id) && before.get(id) !== current.get(id),
    ),
  };
}

export async function writeBundleReport(path, report) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx" });
}

export function resolveBundleReportPath(requested, repository = root) {
  if (typeof requested !== "string" || requested.length === 0) {
    throw new TypeError("Bundle report path is required.");
  }
  const directory = resolve(repository, ".artifacts/bundles");
  const target = resolve(repository, requested);
  if (dirname(target) !== directory || !target.endsWith(".json"))
    throw new TypeError(
      "Bundle report must be a direct .artifacts/bundles/*.json path.",
    );
  return target;
}

async function reportPath(requested) {
  const directory = resolve(root, ".artifacts/bundles");
  const target = resolveBundleReportPath(requested);
  for (const path of [resolve(root, ".artifacts"), directory]) {
    try {
      const info = await lstat(path);
      if (info.isSymbolicLink() || !info.isDirectory())
        throw new TypeError(`${path}: report directory must not be a symlink.`);
    } catch (error) {
      if (error?.code === "ENOENT") await mkdir(path);
      else throw error;
    }
  }
  return target;
}

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    if (!["--stage", "--json", "--changed-from"].includes(argument))
      throw new TypeError(`Unknown bundle argument: ${argument}.`);
    const value = argv[++index];
    if (!value || value.startsWith("--"))
      throw new TypeError(`${argument} requires a value.`);
    options[argument.slice(2).replace("-from", "From")] = value;
  }
  if (!options.stage) throw new TypeError("--stage is required.");
  return options;
}

export async function runBundleCheck(options) {
  validateBundlePolicy(BUNDLE_POLICY);
  const changes = options.changedFrom
    ? await catalogChanges(options.changedFrom)
    : { addedCatalogIds: [], changedCatalogIds: [] };
  const selection = resolveBudgetMode({
    stage: options.stage,
    ...changes,
    comparisonProvided: Boolean(options.changedFrom),
  });
  const measurements = [];
  for (const name of packageFolders)
    measurements.push({
      name,
      ...(await measurePackageDirectory(join(root, "packages", name))),
    });
  const packages = assertWithinBudgets(measurements, selection.mode);
  const report = {
    schemaVersion: 1,
    stage: options.stage,
    mode: selection.mode,
    policyDigest: BUNDLE_POLICY.policyDigest,
    ...changes,
    packages,
  };
  if (options.json)
    await writeBundleReport(await reportPath(options.json), report);
  return report;
}

async function main() {
  const report = await runBundleCheck(parseArguments(process.argv.slice(2)));
  process.stdout.write(
    `Bundle budgets verified for ${report.packages.length} public packages (${report.mode}).\n`,
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
