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
import { basename, dirname, join } from "node:path";
import test from "node:test";
import { publicPackageGraph } from "../../scripts/lib/compatibility-contract.mjs";
import * as compatibilityEnvironment from "../../scripts/lib/compatibility-environment.mjs";
import {
  createPackedWorkspace,
  runCompatibilityProcess,
} from "../../scripts/lib/compatibility-process.mjs";

const { createCompatibilityEnvironment } = compatibilityEnvironment;

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

test("owned compatibility run cache is removed when its operation fails", async () => {
  // Given: a cache parent owned only by this test.
  const root = await mkdtemp(join(tmpdir(), "popcandy-run-cache-test-"));
  const cacheParent = join(root, "caches");
  await mkdir(cacheParent);
  let observedCache;
  try {
    // When: the cache-scoped operation fails after observing its cache.
    await assert.rejects(
      compatibilityEnvironment.withCompatibilityRunCache((cacheRoot) => {
        observedCache = cacheRoot;
        throw new TypeError("Synthetic packing failure.");
      }, cacheParent),
      /Synthetic packing failure/,
    );

    // Then: only the test-owned parent is inspected and the cache is gone.
    assert.equal(dirname(observedCache), cacheParent);
    assert.match(basename(observedCache), /^popcandy-run-cache-/);
    assert.deepEqual(await readdir(cacheParent), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
