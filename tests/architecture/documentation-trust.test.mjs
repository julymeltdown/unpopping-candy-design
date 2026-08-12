import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const paths = [
  "README.md",
  "docs/AI_ASSISTED_POST_CASE_STUDY.md",
  "docs/COMPATIBILITY.md",
  "docs/ACCESSIBILITY.md",
  "docs/SUPPORT.md",
  "docs/SECURITY.md",
  "docs/VERSIONING.md",
  "docs/STORYBOOK_AI.md",
  "docs/PUBLISHING.md",
];

async function fixture() {
  const verifier = await import("../../scripts/verify-docs.mjs");
  const documents = new Map(
    await Promise.all(
      paths.map(async (path) => [
        path,
        await readFile(join(root, path), "utf8"),
      ]),
    ),
  );
  return {
    verifier,
    documents,
    context: await verifier.loadTrustContext(root),
  };
}

function mutate(documents, path, transform) {
  const changed = new Map(documents);
  changed.set(path, transform(changed.get(path)));
  return changed;
}

test("visible appended trust contradictions fail closed", async () => {
  const { verifier, documents, context } = await fixture();
  assert.deepEqual(verifier.trustContractErrors(documents, context), []);

  for (const [label, path, transform] of [
    [
      "all cells passed",
      "docs/COMPATIBILITY.md",
      (source) => `${source}\nAll 140 planned cells passed.\n`,
    ],
    [
      "all cells passed paraphrase",
      "docs/COMPATIBILITY.md",
      (source) => `${source}\nEvery one of the 140 planned cells passed.\n`,
    ],
    [
      "eighth framework",
      "docs/COMPATIBILITY.md",
      (source) =>
        source.replace(
          "## Package-manager matrix",
          "| vite-react-20 | Vite | 9.0.0 | 20.0.0 |\n\n## Package-manager matrix",
        ),
    ],
    [
      "npm availability hidden-negative decoy",
      "README.md",
      (source) =>
        `${source}\n<!-- The nine public packages are not published to npm. -->\nThe nine public packages are available on npm.\n`,
    ],
    [
      "npm installability paraphrase",
      "README.md",
      (source) =>
        `${source}\nAll nine public package candidates can now be installed from npm.\n`,
    ],
    [
      "cloud Registry paraphrase",
      "README.md",
      (source) =>
        `${source}\nA cloud Registry endpoint is ready for consumers.\n`,
    ],
    [
      "web MCP paraphrase",
      "README.md",
      (source) => `${source}\nWe operate an MCP server on the web.\n`,
    ],
    [
      "evals classified public",
      "README.md",
      (source) =>
        source.replace(
          "### Private tooling",
          "| `@unpopping-candy/evals` | `0.1.0` | Public evaluation runtime |\n\n### Private tooling",
        ),
    ],
    [
      "year-long old-minor support",
      "docs/SUPPORT.md",
      (source) => `${source}\nOld minor lines receive fixes for one year.\n`,
    ],
    [
      "year-long support paraphrase",
      "docs/SUPPORT.md",
      (source) =>
        `${source}\nEach prior minor receives maintenance for twelve months.\n`,
    ],
    [
      "independent versions",
      "docs/PUBLISHING.md",
      (source) =>
        `${source}\nPublic packages may be versioned independently.\n`,
    ],
    [
      "validator prop enforcement",
      "docs/AI_ASSISTED_POST_CASE_STUDY.md",
      (source) =>
        `${source}\nThe validator enforces required component props.\n`,
    ],
    [
      "duplicate matrix heading",
      "docs/COMPATIBILITY.md",
      (source) => `${source}\n## Framework and React matrix\n\nDuplicate.\n`,
    ],
    [
      "duplicate limitations heading",
      "README.md",
      (source) => `${source}\n## Current limitations\n\nDuplicate.\n`,
    ],
    [
      "duplicate framework row",
      "docs/COMPATIBILITY.md",
      (source) =>
        source.replace(
          "## Package-manager matrix",
          "| vite-react-19 | Vite | 8.1.0 | 19.2.8 |\n\n## Package-manager matrix",
        ),
    ],
  ]) {
    const errors = verifier.trustContractErrors(
      mutate(documents, path, transform),
      context,
    );
    assert.ok(errors.length > 0, `${label} must fail closed`);
  }
});

test("compatibility evidence stays bound to its historical source commit", async () => {
  const { verifier, documents, context } = await fixture();
  const changed = {
    ...context,
    historicalMatrix: structuredClone(context.historicalMatrix),
    evidence: structuredClone(context.evidence),
  };
  for (const cell of Object.values(changed.historicalMatrix.cells)) {
    if (cell.framework === "vite") cell.frameworkVersion = "9.0.0";
  }
  for (const run of changed.evidence.runs) {
    if (run.framework.name === "vite") run.framework.version = "9.0.0";
  }
  const rewritten = mutate(documents, "docs/COMPATIBILITY.md", (source) =>
    source.replaceAll("8.1.0", "9.0.0"),
  );

  assert.ok(
    verifier.trustContractErrors(rewritten, changed).length > 0,
    "rewriting the current tree must not rewrite historical evidence",
  );

  const changedDigest = {
    ...context,
    evidence: structuredClone(context.evidence),
  };
  changedDigest.evidence.runs[0].tarballs[0].sha256 = "0".repeat(64);
  assert.ok(
    verifier.trustContractErrors(documents, changedDigest).length > 0,
    "a syntactically valid replacement tarball digest must fail closed",
  );

  const wrongCommit = {
    ...context,
    evidence: structuredClone(context.evidence),
  };
  wrongCommit.evidence.sourceCommit =
    "3482eae81ac86a09dbe80755857ce9daa1aa3231";
  assert.equal(
    wrongCommit.evidenceIsExact(wrongCommit.evidence),
    false,
    "an ancestor with a different runner must not claim the retained runs",
  );
});
