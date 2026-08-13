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
  const result = {
    id: "base/vite-react-19/pnpm-11",
    sourceCommit: "a".repeat(40),
    status: "passed",
  };
  const writeResult = async () => {
    await writeFile(resultPath, `${JSON.stringify(result)}\n`);
    return createHash("sha256")
      .update(await readFile(resultPath))
      .digest("hex");
  };
  let resultDigest = await writeResult();
  const catalogPath = join(root, "catalog.json");
  const catalogBytes = `${JSON.stringify({
    schemaVersion: 1,
    packageVersion: "0.3.0-alpha.0",
    entries: [],
  })}\n`;
  await writeFile(catalogPath, catalogBytes);
  const catalogDigest = createHash("sha256").update(catalogBytes).digest("hex");
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
  const candidate = {
    schemaVersion: 1,
    requestedVersion: "0.3.0-alpha.0",
    channel: "next",
    sourceCommit: "a".repeat(40),
    catalogDigest,
    packages,
    verification: {
      agentCheck: "passed",
      packageTests: "passed",
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
  };
  const writeCandidate = () =>
    writeFile(join(root, "candidate.json"), `${JSON.stringify(candidate)}\n`);
  await writeCandidate();
  const inspectManifest = (item) => ({
    name: item.packageName,
    version: item.version,
    repository: {
      url: "https://github.com/julymeltdown/unpopping-candy-design.git",
      directory: `packages/${item.packageName.split("/")[1]}`,
    },
  });
  const inspectMcpReadme = () =>
    '"args": ["-y", "@unpopping-candy/mcp@0.3.0-alpha.0"]\n';
  const inspectArchive = () => [
    { name: "package/package.json", type: "-" },
    { name: "package/README.md", type: "-" },
    { name: "package/LICENSE.md", type: "-" },
    { name: "package/dist/index.js", type: "-" },
  ];
  assert.equal(
    (
      await verifyReleaseCandidate(root, {
        expectedSourceCommit: "a".repeat(40),
        inspectArchive,
        inspectManifest,
        inspectMcpReadme,
      })
    ).packages.length,
    9,
  );
  result.sourceCommit = "c".repeat(40);
  resultDigest = await writeResult();
  candidate.verification.compatibility[0].sha256 = resultDigest;
  await writeCandidate();
  await assert.rejects(
    () =>
      verifyReleaseCandidate(root, {
        inspectArchive,
        inspectManifest,
        inspectMcpReadme,
      }),
    /source commit mismatch/,
  );
  result.sourceCommit = candidate.sourceCommit;
  candidate.verification.compatibility[0].sha256 = await writeResult();
  await writeCandidate();
  await writeFile(
    catalogPath,
    `${JSON.stringify({
      schemaVersion: 1,
      packageVersion: "0.3.0-alpha.0",
      entries: [{ id: "tampered" }],
    })}\n`,
  );
  await assert.rejects(
    () => verifyReleaseCandidate(root, { inspectManifest }),
    /catalog digest mismatch/,
  );
  await writeFile(catalogPath, catalogBytes);
  await assert.rejects(
    () =>
      verifyReleaseCandidate(root, {
        inspectArchive,
        inspectManifest,
        inspectMcpReadme: () =>
          '"args": ["-y", "@unpopping-candy/mcp@0.2.0"]\n',
      }),
    /MCP README must advertise the exact candidate version/,
  );
  await assert.rejects(
    () =>
      verifyReleaseCandidate(root, {
        inspectArchive,
        inspectManifest,
        inspectMcpReadme: () =>
          '"args": ["-y", "@unpopping-candy/mcp@0.3.0-alpha.0"]\n' +
          "npx -y @unpopping-candy/mcp\n",
      }),
    /MCP README must advertise the exact candidate version/,
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
