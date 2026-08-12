import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve } from "node:path";

export const fixtureIds = [
  "base",
  "publish-post",
  "member-moderation",
  "activity-review",
];

export const publicPackageFolders = [
  "cli",
  "icons",
  "knowledge",
  "mcp",
  "registry",
  "social",
  "theme",
  "tokens",
  "ui",
];

export const publicPackageGraph = {
  icons: [],
  knowledge: [],
  tokens: [],
  registry: ["knowledge"],
  theme: ["tokens"],
  ui: ["icons", "tokens"],
  cli: ["knowledge", "registry"],
  social: ["icons", "tokens", "ui"],
  mcp: ["cli", "knowledge", "registry", "tokens"],
};

export const publicPackageNames = publicPackageFolders.map(
  (folder) => `@unpopping-candy/${folder}`,
);

export function pathIsInside(parent, candidate) {
  const path = relative(parent, candidate);
  return path === "" || (!path.startsWith("..") && !isAbsolute(path));
}

export async function assertOutsideWorkspace(workspaceRoot, candidate, label) {
  const [workspacePath, candidatePath] = await Promise.all([
    realpath(workspaceRoot),
    realpath(candidate),
  ]);
  if (pathIsInside(workspacePath, candidatePath)) {
    throw new TypeError(`${label ?? "Path"} must be outside the workspace.`);
  }
  return candidatePath;
}

export function assertObservedVersions(cell, observed) {
  if (observed.frameworkVersion !== cell.frameworkVersion) {
    throw new TypeError(
      `Expected framework ${cell.frameworkVersion}, received ${observed.frameworkVersion}.`,
    );
  }
  if (observed.reactVersion !== cell.reactVersion) {
    throw new TypeError(
      `Expected React ${cell.reactVersion}, received ${observed.reactVersion}.`,
    );
  }
}

function pendingOutcome() {
  return { status: "not-run", durationMs: null };
}

export function createCompatibilityResult({ run, cell, manager, tarballs }) {
  return {
    id: run.id,
    status: "pending",
    stage: "prepare",
    node: process.version,
    packageManager: {
      id: run.manager,
      expectedVersion: manager.version,
      observedVersion: null,
    },
    framework: {
      id: run.cell,
      name: cell.framework,
      expectedVersion: cell.frameworkVersion,
      observedVersion: null,
    },
    react: { expectedVersion: cell.reactVersion, observedVersion: null },
    typescript: {
      expectedVersion: "5.7.3",
      observedVersion: null,
      ...pendingOutcome(),
    },
    browser: {
      name: "chromium",
      observedVersion: null,
      accessibleName: null,
    },
    tarballs: tarballs.map(({ packageName, name, sha256 }) => ({
      packageName,
      name,
      sha256,
    })),
    install: pendingOutcome(),
    typecheck: pendingOutcome(),
    build: pendingOutcome(),
    smokeTest: pendingOutcome(),
    audit: {
      temporaryRootOutsideWorkspace: false,
      tarballOnlyPublicPackages: false,
      workspaceAliases: false,
      privateImportPaths: false,
      managerResolution: {
        nodeLinker: manager.nodeLinker ?? null,
        publicPackagePins: null,
      },
      manifestDependencies: null,
      scenarioImports: null,
    },
  };
}

export async function validatePackedArtifacts(packed, inspectManifest) {
  if (!packed || !Array.isArray(packed.tarballs)) {
    throw new TypeError("Packed workspace must define tarballs.");
  }
  if (packed.tarballs.length !== publicPackageNames.length) {
    throw new TypeError(
      "Packed workspace must contain exactly nine public tarballs.",
    );
  }
  const root = await realpath(packed.root);
  const names = packed.tarballs.map(({ packageName }) => packageName);
  if (
    new Set(names).size !== publicPackageNames.length ||
    [...names].sort().join("\n") !== [...publicPackageNames].sort().join("\n")
  ) {
    throw new TypeError(
      "Packed workspace package names must be exact and unique.",
    );
  }
  const tarballs = [];
  const ordered = publicPackageNames.map((packageName) =>
    packed.tarballs.find((tarball) => tarball.packageName === packageName),
  );
  for (const tarball of ordered) {
    const path = resolve(tarball.path);
    const metadata = await lstat(path);
    const resolvedPath = await realpath(path);
    if (
      metadata.isSymbolicLink() ||
      !metadata.isFile() ||
      !pathIsInside(root, resolvedPath) ||
      basename(path) !== tarball.name
    ) {
      throw new TypeError(`Unsafe packed artifact for ${tarball.packageName}.`);
    }
    const digest = createHash("sha256")
      .update(await readFile(resolvedPath))
      .digest("hex");
    if (digest !== tarball.sha256) {
      throw new TypeError(`Digest mismatch for ${tarball.packageName}.`);
    }
    const manifest = await inspectManifest(resolvedPath, root);
    const manifestName = `${manifest.name.replace("@", "").replace("/", "-")}-${manifest.version}.tgz`;
    if (
      manifest.name !== tarball.packageName ||
      manifest.version !== tarball.version ||
      manifest.private === true ||
      tarball.name !== manifestName
    ) {
      throw new TypeError(`Manifest mismatch for ${tarball.packageName}.`);
    }
    tarballs.push({ ...tarball, path: resolvedPath });
  }
  return { ...packed, root, tarballs };
}

export async function readCompatibilityMatrix(workspaceRoot) {
  const source = await readFile(
    join(workspaceRoot, "fixtures/compatibility/matrix.json"),
    "utf8",
  );
  const value = JSON.parse(source);
  if (!value || typeof value !== "object" || !value.cells || !value.managers) {
    throw new TypeError("Compatibility matrix must define cells and managers.");
  }
  return value;
}

export function parseCompatibilityArguments(argv) {
  const options = { all: false, plan: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    if (argument === "--all" || argument === "--plan") {
      options[argument.slice(2)] = true;
      continue;
    }
    if (
      argument !== "--fixture" &&
      argument !== "--cell" &&
      argument !== "--manager"
    ) {
      throw new TypeError(`Unknown compatibility argument: ${argument}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new TypeError(`${argument} requires a value.`);
    }
    options[argument.slice(2)] = value;
    index += 1;
  }
  return options;
}

export function createCompatibilityPlan(matrix, options) {
  const fixtures = options.fixture ? [options.fixture] : fixtureIds;
  const cells = options.all ? Object.keys(matrix.cells) : [options.cell];
  const managers = options.all
    ? Object.keys(matrix.managers)
    : [options.manager];
  if (!options.all && (!options.fixture || !options.cell || !options.manager)) {
    throw new TypeError(
      "Focused execution requires --fixture, --cell, and --manager.",
    );
  }
  for (const fixture of fixtures) {
    if (!fixtureIds.includes(fixture)) {
      throw new TypeError(`Unknown fixture: ${fixture}`);
    }
  }
  for (const cell of cells) {
    if (!cell || !matrix.cells[cell]) {
      throw new TypeError(`Unknown cell: ${cell}`);
    }
  }
  for (const manager of managers) {
    if (!manager || !matrix.managers[manager]) {
      throw new TypeError(`Unknown manager: ${manager}`);
    }
  }
  return fixtures.flatMap((fixture) =>
    cells.flatMap((cell) =>
      managers.map((manager) => ({
        id: `${fixture}/${cell}/${manager}`,
        fixture,
        cell,
        manager,
      })),
    ),
  );
}
