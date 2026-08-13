import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { link, mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { publicPackageNames } from "../../scripts/lib/compatibility-contract.mjs";
import { verifyPackedReleaseArtifacts } from "../../scripts/lib/release-candidate-verification.mjs";

const execute = promisify(execFile);
const version = "0.3.0-alpha.0";

async function packageFixture(t) {
  const root = await mkdtemp(join(tmpdir(), "popcandy-archive-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "package/dist"), { recursive: true });
  await Promise.all([
    writeFile(join(root, "package/package.json"), "{}\n"),
    writeFile(join(root, "package/README.md"), "candidate\n"),
    writeFile(join(root, "package/LICENSE.md"), "MIT\n"),
    writeFile(join(root, "package/dist/index.js"), "export {};\n"),
  ]);
  return root;
}

async function createArchive(root, name, args = ["package"]) {
  const path = join(root, name);
  await execute("tar", ["-czf", path, "-C", root, ...args]);
  return path;
}

function packed(path) {
  return {
    root: dirname(path),
    tarballs: publicPackageNames.map((packageName) => ({
      packageName,
      version,
      name: `${packageName.split("/")[1]}.tgz`,
      path,
      sha256: "a".repeat(64),
    })),
  };
}

const options = {
  inspectManifest: (item) => ({
    name: item.packageName,
    version,
    repository: {
      url: "https://github.com/julymeltdown/unpopping-candy-design.git",
      directory: `packages/${item.packageName.split("/")[1]}`,
    },
  }),
  inspectMcpReadme: () =>
    '"args": ["-y", "@unpopping-candy/mcp@0.3.0-alpha.0"]\n',
};

async function verify(path) {
  return verifyPackedReleaseArtifacts(packed(path), version, options);
}

async function transformedArchive(root, name, replacement, absolute = false) {
  await writeFile(join(root, "safe"), "unsafe\n");
  const { stdout } = await execute("tar", ["--version"]);
  const path = join(root, name);
  const mode = absolute ? "-cPzf" : "-czf";
  const transform = stdout.includes("bsdtar")
    ? ["-s", `#^safe$#${replacement}#`]
    : [`--transform=s#^safe$#${replacement}#`];
  await execute("tar", [mode, path, "-C", root, ...transform, "safe"]);
  return path;
}

test("candidate archive accepts only the expected package surface", async (t) => {
  // Given: a regular npm-style package archive.
  const root = await packageFixture(t);
  const path = await createArchive(root, "safe.tgz");

  // When/Then: the release boundary accepts the complete expected surface.
  await assert.doesNotReject(() => verify(path));
});

test("candidate archive rejects parent traversal members", async (t) => {
  // Given: an archive whose member escapes package/ through a parent segment.
  const root = await packageFixture(t);
  const path = await transformedArchive(root, "traversal.tgz", "../evil");

  // When/Then: release verification fails before reading package contents.
  await assert.rejects(() => verify(path), /unsafe archive member/);
});

test("candidate archive rejects absolute members", async (t) => {
  // Given: an archive with an absolute package member.
  const root = await packageFixture(t);
  const path = await transformedArchive(
    root,
    "absolute.tgz",
    "/package/evil",
    true,
  );

  // When/Then: release verification fails closed.
  await assert.rejects(() => verify(path), /unsafe archive member/);
});

test("candidate archive rejects symbolic links", async (t) => {
  // Given: a package archive containing a symlink.
  const root = await packageFixture(t);
  await symlink("../README.md", join(root, "package/dist/link"));
  const path = await createArchive(root, "symlink.tgz");

  // When/Then: the non-regular archive member is rejected.
  await assert.rejects(() => verify(path), /regular files and directories/);
});

test("candidate archive rejects hard links", async (t) => {
  // Given: a package archive containing two names for one inode.
  const root = await packageFixture(t);
  await link(
    join(root, "package/dist/index.js"),
    join(root, "package/dist/hard.js"),
  );
  const path = await createArchive(root, "hardlink.tgz");

  // When/Then: hard-link members cannot enter the candidate.
  await assert.rejects(() => verify(path), /regular files and directories/);
});

test("candidate archive rejects duplicate critical members", async (t) => {
  // Given: package.json appears twice in the same archive.
  const root = await packageFixture(t);
  const path = await createArchive(root, "duplicate.tgz", [
    "package/package.json",
    "package/package.json",
    "package/README.md",
    "package/LICENSE.md",
    "package/dist/index.js",
  ]);

  // When/Then: ambiguous duplicate contents fail closed.
  await assert.rejects(() => verify(path), /duplicate archive member/);
});

test("candidate archive rejects forbidden hidden contents", async (t) => {
  // Given: a secret-bearing hidden file was accidentally packed.
  const root = await packageFixture(t);
  await writeFile(join(root, "package/.env"), "TOKEN=synthetic\n");
  const path = await createArchive(root, "forbidden.tgz");

  // When/Then: the unexpected content is rejected.
  await assert.rejects(() => verify(path), /archive member/);
});
