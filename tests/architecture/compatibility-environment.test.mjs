import assert from "node:assert/strict";
import {
  chmod,
  mkdir,
  mkdtemp,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { publicPackageGraph } from "../../scripts/lib/compatibility-contract.mjs";
import { createCompatibilityEnvironment } from "../../scripts/lib/compatibility-environment.mjs";
import {
  createPackedWorkspace,
  runCompatibilityProcess,
} from "../../scripts/lib/compatibility-process.mjs";
import { runCompatibilityMatrix } from "../../scripts/run-compatibility-matrix.mjs";

function runCacheEntries() {
  return readdir(tmpdir()).then((entries) =>
    entries.filter((entry) => entry.startsWith("popcandy-run-cache-")).sort(),
  );
}

test("compatibility subprocesses exclude parent credentials and runtime injection", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-environment-"));
  try {
    const result = await runCompatibilityProcess({
      command: process.execPath,
      args: ["-e", "process.stdout.write(JSON.stringify(process.env))"],
      cwd: root,
      homeRoot: root,
      environment: {
        HOME: "/synthetic-credential-home",
        PATH: process.env.PATH,
        LANG: "C",
        NODE_OPTIONS: "--throw-deprecation",
        NPM_TOKEN: "synthetic-npm-secret",
        POPCANDY_TEST_SECRET: "synthetic-project-secret",
      },
    });
    const observed = JSON.parse(result.output);

    assert.equal(observed.PATH, process.env.PATH);
    assert.equal(observed.LANG, "C");
    assert.equal(observed.CI, "1");
    assert.equal(observed.HOME, root);
    assert.equal(observed.USERPROFILE, root);
    assert.equal(observed.NPM_CONFIG_USERCONFIG, join(root, ".npmrc"));
    assert.equal(observed.NPM_CONFIG_GLOBALCONFIG, join(root, ".npm-globalrc"));
    assert.equal(observed.NODE_OPTIONS, undefined);
    assert.equal(observed.NPM_TOKEN, undefined);
    assert.equal(observed.POPCANDY_TEST_SECRET, undefined);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("compatibility subprocesses default their isolated home to the working root", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-default-home-"));
  try {
    const { output } = await runCompatibilityProcess({
      command: process.execPath,
      args: ["-e", "process.stdout.write(JSON.stringify(process.env))"],
      cwd: root,
      environment: { PATH: process.env.PATH },
    });
    const observed = JSON.parse(output);

    assert.equal(observed.HOME, root);
    assert.equal(observed.NPM_CONFIG_USERCONFIG, join(root, ".npmrc"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("compatibility cells share only a run-scoped package cache", () => {
  const firstHome = join(tmpdir(), "popcandy-first-home");
  const secondHome = join(tmpdir(), "popcandy-second-home");
  const cacheRoot = join(tmpdir(), "popcandy-run-cache");

  const first = createCompatibilityEnvironment({}, firstHome, cacheRoot);
  const second = createCompatibilityEnvironment({}, secondHome, cacheRoot);

  assert.notEqual(first.HOME, second.HOME);
  assert.equal(first.NPM_CONFIG_CACHE, join(cacheRoot, "npm"));
  assert.equal(first.NPM_CONFIG_CACHE, second.NPM_CONFIG_CACHE);
  assert.equal(first.COREPACK_HOME, join(cacheRoot, "corepack"));
  assert.equal(first.XDG_CACHE_HOME, second.XDG_CACHE_HOME);
  assert.equal(first.XDG_DATA_HOME, second.XDG_DATA_HOME);
});

test("packed output excludes package-manager caches", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-pack-output-"));
  const workspaceRoot = join(root, "workspace");
  const outputRoot = join(root, "output");
  const binRoot = join(root, "bin");
  await Promise.all([
    mkdir(outputRoot),
    mkdir(binRoot),
    ...Object.keys(publicPackageGraph).map((folder) =>
      mkdir(join(workspaceRoot, "packages", folder), { recursive: true }),
    ),
  ]);
  const managerPath = join(binRoot, "pnpm");
  await writeFile(
    managerPath,
    `#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
for (const name of ["COREPACK_HOME", "NPM_CONFIG_CACHE"]) mkdirSync(process.env[name], { recursive: true });
const args = process.argv.slice(2);
if (args[0] === "--version") process.stdout.write("11.4.0");
const output = args.indexOf("--out");
if (output >= 0) writeFileSync(args[output + 1], "synthetic-tarball");
`,
  );
  await chmod(managerPath, 0o755);
  for (const [folder, dependencies] of Object.entries(publicPackageGraph)) {
    await writeFile(
      join(workspaceRoot, "packages", folder, "package.json"),
      JSON.stringify({
        name: `@unpopping-candy/${folder}`,
        version: "0.2.0",
        dependencies: Object.fromEntries(
          dependencies.map((name) => [`@unpopping-candy/${name}`, "0.2.0"]),
        ),
      }),
    );
  }

  try {
    const packed = await createPackedWorkspace({
      workspaceRoot,
      outputRoot,
      environment: { PATH: `${binRoot}:${process.env.PATH}` },
    });

    assert.equal(packed.tarballs.length, 9);
    assert.deepEqual(
      (await readdir(outputRoot)).sort(),
      packed.tarballs.map(({ name }) => name).sort(),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("matrix removes its run cache when workspace packing fails", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-pack-failure-"));
  const fixtureRoot = join(root, "fixtures", "compatibility");
  await mkdir(fixtureRoot, { recursive: true });
  await writeFile(
    join(fixtureRoot, "matrix.json"),
    JSON.stringify({
      cells: {
        "vite-react-19": {
          framework: "vite",
          frameworkVersion: "8.1.0",
          reactVersion: "19.2.8",
        },
      },
      managers: {
        "pnpm-11": { package: "pnpm", version: "11.21.0" },
      },
    }),
  );
  const before = await runCacheEntries();

  try {
    await assert.rejects(
      runCompatibilityMatrix({
        workspaceRoot: root,
        fixture: "base",
        cell: "vite-react-19",
        manager: "pnpm-11",
      }),
    );
    assert.deepEqual(await runCacheEntries(), before);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
