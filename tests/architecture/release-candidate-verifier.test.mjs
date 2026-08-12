import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { verifyReleaseCandidate } from "../../scripts/verify-release-candidate.mjs";
import { publicPackageNames } from "../../scripts/lib/compatibility-contract.mjs";

test("release candidate verifier re-hashes every exact artifact", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-candidate-verifier-"));
  await mkdir(join(root, "packages"));
  await mkdir(join(root, "compatibility/base/vite-react-19"), {
    recursive: true,
  });
  const resultPath = join(
    root,
    "compatibility/base/vite-react-19/pnpm-11.json",
  );
  await writeFile(
    resultPath,
    `${JSON.stringify({ id: "base/vite-react-19/pnpm-11", status: "passed" })}\n`,
  );
  const resultDigest = createHash("sha256")
    .update(await readFile(resultPath))
    .digest("hex");
  const packages = [];
  for (const packageName of publicPackageNames) {
    const name = `${packageName.slice(1).replace("/", "-")}-0.3.0-alpha.0.tgz`;
    const path = join(root, "packages", name);
    await writeFile(path, packageName);
    packages.push({
      name: packageName,
      version: "0.3.0-alpha.0",
      path: `packages/${name}`,
      sha256: createHash("sha256").update(packageName).digest("hex"),
    });
  }
  await writeFile(
    join(root, "candidate.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      requestedVersion: "0.3.0-alpha.0",
      channel: "next",
      sourceCommit: "a".repeat(40),
      catalogDigest: "b".repeat(64),
      packages,
      verification: {
        agentCheck: "passed",
        pureTests: "passed",
        typecheck: "passed",
        packageBuild: "passed",
        compatibility: [
          {
            resultPath: "compatibility/base/vite-react-19/pnpm-11.json",
            id: "base/vite-react-19/pnpm-11",
            status: "passed",
            sha256: resultDigest,
          },
        ],
      },
    })}\n`,
  );
  assert.equal(
    (
      await verifyReleaseCandidate(root, {
        expectedSourceCommit: "a".repeat(40),
        inspectManifest: (item) => ({
          name: item.packageName,
          version: item.version,
          repository: {
            url: "https://github.com/julymeltdown/unpopping-candy-design.git",
            directory: `packages/${item.packageName.split("/")[1]}`,
          },
        }),
      })
    ).packages.length,
    9,
  );
  await assert.rejects(
    () =>
      verifyReleaseCandidate(root, {
        expectedSourceCommit: "c".repeat(40),
      }),
    /metadata is invalid/,
  );
  await writeFile(join(root, "packages/extra.tgz"), "extra");
  await assert.rejects(
    () => verifyReleaseCandidate(root),
    /packages directory must be exact/,
  );
  await import("node:fs/promises").then(({ rm }) =>
    rm(join(root, "packages/extra.tgz")),
  );
  await writeFile(join(root, packages[0].path), "tampered");
  await assert.rejects(() => verifyReleaseCandidate(root), /digest mismatch/);
});
