import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runCompatibilityProcess } from "../../scripts/lib/compatibility-process.mjs";
import { createCompatibilityEnvironment } from "../../scripts/lib/compatibility-environment.mjs";

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
