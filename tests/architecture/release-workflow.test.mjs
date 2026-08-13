import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";

const cliRequire = createRequire(
  new URL("../../packages/cli/package.json", import.meta.url),
);
const { parse: parseYaml } = cliRequire("yaml");

test("delivery workflows default to verification and gate every external write", async () => {
  const repository = new URL("../..", import.meta.url);
  const [release, storybook, packageSource] = await Promise.all([
    readFile(new URL(".github/workflows/release.yml", repository), "utf8"),
    readFile(new URL(".github/workflows/storybook.yml", repository), "utf8"),
    readFile(new URL("package.json", repository), "utf8"),
  ]);
  const packageJson = JSON.parse(packageSource);
  for (const literal of [
    "default: false",
    "id-token: write",
    "environment: npm-release",
    "npm@12.0.2",
    "verify-release-authorizations.mjs --scope npm,brand",
    "0.3.0-alpha.0 --channel next",
    "verify-release-candidate.mjs",
    '--source-commit "$GITHUB_SHA"',
    'npm publish "$tarball" --provenance --access public --tag next',
  ]) {
    assert.ok(release.includes(literal), literal);
  }
  assert.doesNotMatch(release, /NODE_AUTH_TOKEN|NPM_TOKEN|--tag latest/);
  assert.equal(packageJson.scripts.release, undefined);
  assert.ok(packageJson.scripts["release:candidate"]);
  assert.doesNotMatch(
    Object.values(packageJson.scripts).join("\n"),
    /(?:changeset|npm) publish/,
  );
  const releaseWorkflow = parseYaml(release);
  const upload = releaseWorkflow.jobs.release.steps.find(
    (step) => step.name === "Upload candidate evidence without publishing",
  );
  assert.ok(upload);
  const uploadedPaths = upload.with.path.trim().split("\n");
  for (const path of [
    ".artifacts/releases/stage-0-alpha.0/candidate.json",
    ".artifacts/releases/stage-0-alpha.0/catalog.json",
    ".artifacts/releases/stage-0-alpha.0/packages/*.tgz",
    ".artifacts/releases/stage-0-alpha.0/compatibility/**/*.json",
  ]) {
    assert.ok(uploadedPaths.includes(path), path);
  }
  for (const literal of [
    "POPCANDY_CHROMATIC_ENABLED == 'true'",
    "POPCANDY_PAGES_ENABLED == 'true'",
    "pnpm test:storybook",
    "pnpm test:browser",
    "actions/configure-pages@v5",
    "actions/upload-pages-artifact@v3",
    "actions/deploy-pages@v4",
    "chromaui/action@v13",
  ]) {
    assert.ok(storybook.includes(literal), literal);
  }
});

test("public packages bind npm provenance to the target GitHub repository", async () => {
  const repository = new URL("../..", import.meta.url);
  for (const folder of [
    "tokens",
    "theme",
    "icons",
    "ui",
    "social",
    "knowledge",
    "registry",
    "cli",
    "mcp",
  ]) {
    const manifest = JSON.parse(
      await readFile(
        new URL(`packages/${folder}/package.json`, repository),
        "utf8",
      ),
    );
    assert.deepEqual(manifest.repository, {
      type: "git",
      url: "https://github.com/julymeltdown/unpopping-candy-design.git",
      directory: `packages/${folder}`,
    });
  }
});
