import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { trustPaths } from "../../scripts/lib/documentation-policy.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("trust policy rejects unreviewed wording independent of phrasing", async () => {
  const verifier = await import("../../scripts/verify-docs.mjs");
  const documents = new Map(
    await Promise.all(
      trustPaths.map(async (path) => [
        path,
        await readFile(join(root, path), "utf8"),
      ]),
    ),
  );
  const context = await verifier.loadTrustContext(root);
  assert.deepEqual(verifier.trustContractErrors(documents, context), []);

  for (const [path, claim] of [
    ["README.md", "All nine libraries can be downloaded through npm."],
    ["README.md", "The packages are only available from npm."],
    ["README.md", "The Registry is publicly accessible."],
    ["README.md", "The Registry is available only on the internet."],
    ["README.md", "Consumers can connect to our public MCP endpoint."],
    [
      "README.md",
      "Although the examples are local, consumers can connect to our public MCP endpoint.",
    ],
    ["docs/COMPATIBILITY.md", "All 140 compatibility scenarios succeeded."],
    [
      "docs/COMPATIBILITY.md",
      "The 140 compatibility configurations were verified.",
    ],
    ["docs/SUPPORT.md", "Superseded minors receive patches for a year."],
    ["docs/SUPPORT.md", "Earlier releases are covered for twelve months."],
    ["docs/SUPPORT.md", "Previous minors only receive support for a year."],
  ]) {
    const changed = new Map(documents);
    changed.set(path, `${documents.get(path)}\n${claim}\n`);
    assert.ok(
      verifier.trustContractErrors(changed, context).length > 0,
      `${claim} must require trust-policy review`,
    );
  }
});
