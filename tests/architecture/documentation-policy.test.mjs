import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  approvedTrustDocumentErrors,
  trustPaths,
} from "../../scripts/lib/documentation-policy.mjs";

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

test("historical QA evidence requires an explicit policy review", async () => {
  // Given: the complete approved document set plus the retained QA evidence.
  const documents = new Map(
    await Promise.all(
      [...trustPaths, "docs/QA_REPORT.md"].map(async (path) => [
        path,
        await readFile(join(root, path), "utf8"),
      ]),
    ),
  );
  const changed = new Map(documents);
  changed.set("docs/QA_REPORT.md", `${documents.get("docs/QA_REPORT.md")}\n`);

  // When: an unreviewed change alters the historical evidence.
  const errors = approvedTrustDocumentErrors(changed);

  // Then: the machine-consumed trust policy rejects it.
  assert.ok(
    errors.some((error) => error.startsWith("docs/QA_REPORT.md:")),
    "historical QA evidence must be covered by the trust policy",
  );
});
