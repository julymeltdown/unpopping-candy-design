import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  extractRelativeMarkdownLinks,
  hasBalancedCodeFences,
} from "../../scripts/lib/markdown-contract.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const readDocument = (path) => readFile(join(root, path), "utf8");

test("markdown contract extracts only repository-relative links", () => {
  const source = `
[architecture](./docs/ARCHITECTURE.md)
[section](#local)
[website](https://example.com)
[email](mailto:team@example.com)
![preview](./docs/preview/image.png "Preview")
`;

  assert.deepEqual(extractRelativeMarkdownLinks(source), [
    "./docs/ARCHITECTURE.md",
    "./docs/preview/image.png",
  ]);
});

test("markdown contract detects balanced fenced code blocks", () => {
  assert.equal(hasBalancedCodeFences("```ts\nconst ok = true;\n```\n"), true);
  assert.equal(hasBalancedCodeFences("```ts\nconst broken = true;\n"), false);
});

test("README keeps the bounded landing and adopter workflow", async () => {
  const source = await readDocument("README.md");
  const lineCount = source.trimEnd().split(/\r?\n/).length;
  assert.ok(
    lineCount >= 200 && lineCount <= 300,
    `README has ${lineCount} lines`,
  );
  assert.match(
    source,
    /!\[Unpopping Candy component overview\]\(\.\/docs\/preview\/captures\/unpopping-candy-overview\.png\)/,
  );
  for (const command of ["info", "search", "get", "compose", "validate"]) {
    assert.match(source, new RegExp(`npm run popcandy -- ${command}`));
  }
  assert.match(source, /corepack pnpm create vite@8\.1\.0/);
  assert.match(source, /manifest\.scripts\.popcandy = 'popcandy'/);
  assert.match(
    source,
    /manifest\.devDependencies\['@vitejs\/plugin-react'\] = '6\.0\.1'/,
  );
  assert.doesNotMatch(source, /@vitejs\/plugin-react'\] = '5\.1\.4'/);
});

test("documentation verifier fails closed when trust documents are incomplete", async () => {
  // Given: a deliberately incomplete in-memory trust-document set.
  const verifier = await import("../../scripts/verify-docs.mjs");

  // When: the production trust-contract verifier inspects it.
  const errors = verifier.trustContractErrors(
    new Map([["README.md", "# Unpopping Candy\n"]]),
  );

  // Then: both the short landing page and every missing policy are rejected.
  assert.ok(
    errors.some((error) => error.includes("README.md: expected 200-300 lines")),
  );
  for (const path of [
    "docs/AI_ASSISTED_POST_CASE_STUDY.md",
    "docs/COMPATIBILITY.md",
    "docs/ACCESSIBILITY.md",
    "docs/SUPPORT.md",
    "docs/SECURITY.md",
    "docs/VERSIONING.md",
  ]) {
    assert.ok(
      errors.some((error) =>
        error.includes(`${path}: required trust document is missing`),
      ),
    );
  }
});

test("documentation verifier compares structured trust claims with canonical sources", async () => {
  const verifier = await import("../../scripts/verify-docs.mjs");
  const documents = new Map(
    await Promise.all(
      [
        "README.md",
        "docs/AI_ASSISTED_POST_CASE_STUDY.md",
        "docs/COMPATIBILITY.md",
        "docs/ACCESSIBILITY.md",
        "docs/SUPPORT.md",
        "docs/SECURITY.md",
        "docs/VERSIONING.md",
        "docs/STORYBOOK_AI.md",
        "docs/PUBLISHING.md",
      ].map(async (path) => [path, await readDocument(path)]),
    ),
  );
  const context = await verifier.loadTrustContext(root);
  const mutate = (path, transform) => {
    const changed = new Map(documents);
    changed.set(path, transform(changed.get(path)));
    return verifier.trustContractErrors(changed, context);
  };

  assert.deepEqual(verifier.trustContractErrors(documents, context), []);
  for (const [label, path, transform] of [
    [
      "public/private swap",
      "README.md",
      (source) =>
        source
          .replace("| `@unpopping-candy/ui`", "| `@unpopping-candy/TEMP`")
          .replace("| `@unpopping-candy/evals`", "| `@unpopping-candy/ui`")
          .replace("| `@unpopping-candy/TEMP`", "| `@unpopping-candy/evals`"),
    ],
    [
      "eighth framework cell",
      "docs/COMPATIBILITY.md",
      (source) =>
        source.replace(
          /(\| react-router-7-react-19[^\n]+\|)/,
          "$1\n| extra                         | Vite         | 8.1.0   | 19.2.8 |",
        ),
    ],
    [
      "unexecuted cells claimed passed",
      "docs/COMPATIBILITY.md",
      (source) =>
        source.replace(
          "remaining 134 planned combinations were not executed",
          "remaining 134 planned combinations passed",
        ),
    ],
    [
      "npm contradiction",
      "README.md",
      (source) =>
        source.replace(
          "The nine public packages are not published to npm",
          "The nine public packages are published to npm",
        ),
    ],
    [
      "remote Registry contradiction",
      "README.md",
      (source) =>
        source.replace(
          "There is no remote Registry",
          "A remote Registry is available",
        ),
    ],
    [
      "hosted MCP contradiction",
      "README.md",
      (source) =>
        source.replace(
          "There is no hosted MCP service",
          "A hosted MCP service is available",
        ),
    ],
    [
      "model-evidence contradiction",
      "README.md",
      (source) =>
        source.replace(
          "Stage 0 makes no public model-quality claim",
          "Stage 0 makes a public model-quality claim",
        ),
    ],
    [
      "indefinite old-minor support",
      "docs/SUPPORT.md",
      (source) =>
        `${source}\nAll old minor lines receive fixes indefinitely.\n`,
    ],
  ]) {
    assert.ok(mutate(path, transform).length > 0, `${label} must fail closed`);
  }
});

test("documentation links reject prefix siblings and escaping symlinks", async () => {
  const verifier = await import("../../scripts/verify-docs.mjs");
  const sandbox = await mkdtemp(join(tmpdir(), "popcandy-doc-links-"));
  const repo = join(sandbox, "repo");
  const sibling = join(sandbox, "repository-sibling");
  try {
    await mkdir(join(repo, "docs"), { recursive: true });
    await mkdir(sibling);
    await writeFile(join(repo, "README.md"), "# fixture\n");
    await writeFile(join(sibling, "outside.md"), "# outside\n");
    await symlink(join(sibling, "outside.md"), join(repo, "docs", "escape.md"));

    assert.match(
      await verifier.relativeLinkError(
        repo,
        join(repo, "README.md"),
        "../repository-sibling/outside.md",
      ),
      /escapes repository root/,
    );
    assert.match(
      await verifier.relativeLinkError(
        repo,
        join(repo, "README.md"),
        "./docs/escape.md",
      ),
      /escapes repository root/,
    );
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});
