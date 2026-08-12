import assert from "node:assert/strict";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import {
  extractModuleSpecifiers,
  listFiles,
  packageNameFromSpecifier,
} from "../../scripts/lib/project-inspection.mjs";

const execFileAsync = promisify(execFile);
const workspaceRoot = new URL("../..", import.meta.url).pathname;
const matrixPath = join(workspaceRoot, "fixtures/compatibility/matrix.json");
const runnerPath = join(workspaceRoot, "scripts/run-compatibility-matrix.mjs");

async function snapshotTree(root) {
  const exists = await access(root).then(
    () => true,
    () => false,
  );
  if (!exists) return [];
  const entries = (await readdir(root, { recursive: true })).sort();
  const snapshot = [];
  for (const entry of entries) {
    const metadata = await stat(join(root, entry));
    snapshot.push([entry, metadata.size, metadata.mtimeMs]);
  }
  return snapshot;
}

test("module inspection identifies public package boundaries", () => {
  const source = `import React from 'react';\nimport '@unpopping-candy/ui/styles.css';\nexport { x } from './x.js';\nconst y = import('@unpopping-candy/social');`;
  assert.deepEqual(
    new Set(extractModuleSpecifiers(source)),
    new Set([
      "react",
      "@unpopping-candy/ui/styles.css",
      "./x.js",
      "@unpopping-candy/social",
    ]),
  );
  assert.equal(
    packageNameFromSpecifier("@unpopping-candy/ui/button"),
    "@unpopping-candy/ui",
  );
  assert.equal(packageNameFromSpecifier("react/jsx-runtime"), "react");
});

test("repository inspection skips installed dependencies and build artifacts", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-inspection-"));
  try {
    await Promise.all([
      mkdir(join(root, "node_modules", "dependency"), { recursive: true }),
      mkdir(join(root, "dist"), { recursive: true }),
    ]);
    await Promise.all(
      [
        "package.json",
        "node_modules/dependency/package.json",
        "dist/package.json",
      ].map((path) => writeFile(join(root, path), "{}")),
    );
    assert.deepEqual(
      await listFiles(root, (path) => path.endsWith("package.json")),
      [join(root, "package.json")],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("compatibility matrix pins the approved framework and manager lanes", async () => {
  // Given: the approved Stage 0 compatibility contract.
  const cellRows = [
    "vite-react-18/vite/8.1.0/18.3.1",
    "vite-react-19/vite/8.1.0/19.2.8",
    "next-15-react-18/next/15.5.23/18.3.1",
    "next-15-react-19/next/15.5.23/19.2.8",
    "next-16-react-19/next/16.3.0/19.2.8",
    "react-router-7-react-18/react-router/7.18.2/18.3.1",
    "react-router-7-react-19/react-router/7.18.2/19.2.8",
  ];
  const managerRows = [
    "npm-10/npm/10.9.9/none",
    "npm-11/npm/11.19.0/none",
    "pnpm-10/pnpm/10.34.5/none",
    "pnpm-11/pnpm/11.21.0/none",
    "yarn-4/@yarnpkg/cli-dist/4.18.0/node-modules",
  ];

  // When: the installed matrix boundary is parsed.
  const matrix = JSON.parse(await readFile(matrixPath, "utf8"));

  // Then: every exact lane is present and no extra lane can silently expand support.
  assert.deepEqual(
    Object.entries(matrix.cells).map(
      ([id, cell]) =>
        `${id}/${cell.framework}/${cell.frameworkVersion}/${cell.reactVersion}`,
    ),
    cellRows,
  );
  assert.deepEqual(
    Object.entries(matrix.managers).map(
      ([id, manager]) =>
        `${id}/${manager.package}/${manager.version}/${manager.nodeLinker ?? "none"}`,
    ),
    managerRows,
  );
});

test("compatibility plan enumerates unique runs without mutating consumers or artifacts", async () => {
  // Given: a process environment with no package-manager executable available.
  const tempEntriesBefore = (await readdir(tmpdir())).filter((entry) =>
    entry.startsWith("popcandy-consumer-"),
  );
  const artifactPath = join(workspaceRoot, ".artifacts/compatibility");
  const packagePath = join(workspaceRoot, "packages");
  const snapshotsBefore = await Promise.all([
    snapshotTree(artifactPath),
    snapshotTree(packagePath),
  ]);
  const runPlan = async (args) => {
    const { stdout } = await execFileAsync(
      process.execPath,
      [runnerPath, "--", ...args, "--plan"],
      {
        cwd: workspaceRoot,
        env: { ...process.env, PATH: "" },
        maxBuffer: 1024 * 1024,
        timeout: 10_000,
      },
    );
    return JSON.parse(stdout);
  };

  // When: focused-fixture and complete plans are requested.
  const publishPostPlan = await runPlan(["--fixture", "publish-post", "--all"]);
  const fullPlan = await runPlan(["--all"]);

  // Then: counts and IDs are exact, and plan mode touched no consumer or artifact boundary.
  assert.equal(publishPostPlan.runs.length, 35);
  assert.equal(fullPlan.runs.length, 140);
  assert.equal(new Set(publishPostPlan.runs.map((run) => run.id)).size, 35);
  assert.equal(new Set(fullPlan.runs.map((run) => run.id)).size, 140);
  assert.deepEqual(
    (await readdir(tmpdir())).filter((entry) =>
      entry.startsWith("popcandy-consumer-"),
    ),
    tempEntriesBefore,
  );
  assert.deepEqual(
    await Promise.all([snapshotTree(artifactPath), snapshotTree(packagePath)]),
    snapshotsBefore,
  );
});

test("compatibility runner exposes the only reusable pack and matrix engine", async () => {
  // Given: later release stages import the canonical packed-consumer boundary.
  const runner = await import("../../scripts/run-compatibility-matrix.mjs");

  // When: the public module surface is inspected.
  // Then: both reusable engines are exported without invoking main on import.
  assert.deepEqual(Object.keys(runner).sort(), [
    "packPublicWorkspace",
    "runCompatibilityMatrix",
  ]);
});

test("compatibility evidence enforces exact observed versions and names", async () => {
  const contract = await import("../../scripts/lib/compatibility-contract.mjs");
  assert.throws(
    () =>
      contract.assertObservedVersions(
        { frameworkVersion: "8.1.0", reactVersion: "19.2.8" },
        { frameworkVersion: "8.1.1", reactVersion: "19.2.8" },
      ),
    /Expected framework 8.1.0, received 8.1.1/,
  );
  const consumer = await readFile(
    join(workspaceRoot, "scripts/lib/compatibility-consumer.mjs"),
    "utf8",
  );
  assert.match(consumer, /exact: true/);
  assert.match(consumer, /toHaveAccessibleName\(expectedName\)/);
});
