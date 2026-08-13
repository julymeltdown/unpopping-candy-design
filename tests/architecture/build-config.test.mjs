import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import {
  classifyPackageManifest,
  isCanonicalPackageDirectory,
  PRIVATE_TOOL_PACKAGE_NAMES,
  PUBLIC_PACKAGE_NAMES,
} from "../../scripts/lib/public-packages.mjs";
import { parseChangesetFrontmatterPackageNames } from "../../scripts/lib/changeset-frontmatter.mjs";

const root = new URL("../..", import.meta.url);

test("TypeScript build rewrites source .ts imports to runnable .js imports", async () => {
  const config = JSON.parse(
    await readFile(new URL("tsconfig.base.json", root), "utf8"),
  );
  assert.equal(config.compilerOptions.allowImportingTsExtensions, true);
  assert.equal(config.compilerOptions.rewriteRelativeImportExtensions, true);
});

test("CI installs an immutable pnpm 11.4.0 workspace", async () => {
  const packageJson = JSON.parse(
    await readFile(new URL("package.json", root), "utf8"),
  );
  const ci = await readFile(new URL(".github/workflows/ci.yml", root), "utf8");

  assert.equal(packageJson.packageManager, "pnpm@11.4.0");
  assert.match(ci, /pnpm install --frozen-lockfile/);
  assert.doesNotMatch(ci, /--no-frozen-lockfile/);
});

test("CI materializes package exports before gates that resolve them", async () => {
  const ci = await readFile(new URL(".github/workflows/ci.yml", root), "utf8");
  const build = ci.indexOf("run: pnpm build:packages");

  assert.ok(build > ci.indexOf("run: pnpm install --frozen-lockfile"));
  for (const command of [
    "run: pnpm test:pure",
    "run: pnpm verify",
    "run: pnpm typecheck",
  ]) {
    assert.ok(build < ci.indexOf(command), command);
  }
});

test("published runtime tools declare the supported Node release lines", async () => {
  for (const packageName of ["cli", "mcp"]) {
    const manifest = JSON.parse(
      await readFile(
        new URL(`packages/${packageName}/package.json`, root),
        "utf8",
      ),
    );

    assert.equal(manifest.engines?.node, ">=22.13.0 <23 || >=24 <25");
  }
});

test("Vite library builds remove stale output before emitting", async () => {
  for (const packageName of ["theme", "icons", "ui", "social"]) {
    const config = await readFile(
      new URL(`packages/${packageName}/vite.config.ts`, root),
      "utf8",
    );
    assert.match(config, /emptyOutDir:\s*true/);
    assert.doesNotMatch(config, /emptyOutDir:\s*false/);
  }
});

test("release configuration publishes exactly the coordinated public package set", async () => {
  const changesets = JSON.parse(
    await readFile(new URL(".changeset/config.json", root), "utf8"),
  );
  const changesetPackageNames = [];
  const changesetFiles = await readdir(new URL(".changeset/", root));

  for (const changesetFile of changesetFiles.filter((name) =>
    name.endsWith(".md"),
  )) {
    const contents = await readFile(
      new URL(`.changeset/${changesetFile}`, root),
      "utf8",
    );
    changesetPackageNames.push(
      ...parseChangesetFrontmatterPackageNames(contents),
    );
  }

  assert.equal(PUBLIC_PACKAGE_NAMES.length, 9);
  assert.deepEqual(PRIVATE_TOOL_PACKAGE_NAMES, [
    "@unpopping-candy/evals",
    "@unpopping-candy/figma",
  ]);
  assert.equal(
    classifyPackageManifest({ name: "@unpopping-candy/evals" }),
    "private-tool",
  );
  assert.equal(
    classifyPackageManifest({ name: "@unpopping-candy/figma" }),
    "private-tool",
  );
  assert.deepEqual(changesets.fixed, [PUBLIC_PACKAGE_NAMES]);
  assert.deepEqual(
    changesetPackageNames.filter((name) =>
      PRIVATE_TOOL_PACKAGE_NAMES.includes(name),
    ),
    [],
  );
});

test("Changeset frontmatter parser detects private tools in supported key forms", () => {
  const packageNames = parseChangesetFrontmatterPackageNames(`---
"@unpopping-candy/evals": patch
'@unpopping-candy/figma': minor
@unpopping-candy/evals: patch
@unpopping-candy/figma: minor
---

"@unpopping-candy/evals": patch
`);

  assert.deepEqual(
    packageNames.filter((name) => PRIVATE_TOOL_PACKAGE_NAMES.includes(name)),
    [
      "@unpopping-candy/evals",
      "@unpopping-candy/figma",
      "@unpopping-candy/evals",
      "@unpopping-candy/figma",
    ],
  );
});

test("package policy accepts only canonical package directories", () => {
  assert.equal(
    isCanonicalPackageDirectory("/repository/packages/evals", {
      name: "@unpopping-candy/evals",
    }),
    true,
  );
  assert.equal(
    isCanonicalPackageDirectory("/repository/packages/copied-evals", {
      name: "@unpopping-candy/evals",
    }),
    false,
  );
  assert.equal(
    isCanonicalPackageDirectory("/repository/packages/unknown", {
      name: "@unpopping-candy/unknown",
    }),
    false,
  );
});
