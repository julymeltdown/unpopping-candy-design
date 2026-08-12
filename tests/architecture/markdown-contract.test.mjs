import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  extractRelativeMarkdownLinks,
  hasBalancedCodeFences,
} from "../../scripts/lib/markdown-contract.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const readDocument = (path) => readFile(join(root, path), "utf8");

const publicPackages = [
  "@unpopping-candy/tokens",
  "@unpopping-candy/theme",
  "@unpopping-candy/icons",
  "@unpopping-candy/ui",
  "@unpopping-candy/social",
  "@unpopping-candy/knowledge",
  "@unpopping-candy/registry",
  "@unpopping-candy/cli",
  "@unpopping-candy/mcp",
];

const privateTools = ["@unpopping-candy/evals", "@unpopping-candy/figma"];

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

test("README is a bounded adoption page with one local package and agent workflow", async () => {
  // Given: the repository landing page consumed by a new adopter.
  // When: its stable adoption contract is inspected.
  const source = await readDocument("README.md");
  const lineCount = source.trimEnd().split(/\r?\n/).length;

  // Then: it is concise, keeps the overview, and exposes exact local workflows and package roles.
  assert.ok(
    lineCount >= 200 && lineCount <= 300,
    `README has ${lineCount} lines`,
  );
  assert.match(
    source,
    /!\[Unpopping Candy component overview\]\(\.\/docs\/preview\/captures\/unpopping-candy-overview\.png\)/,
  );
  for (const command of [
    "npm run popcandy -- info --path . --json",
    'npm run popcandy -- search "publish post" --path . --json',
    "npm run popcandy -- get social.post-composer-view --path . --json",
    'npm run popcandy -- compose "publish a post with pending, success, and error states" --path . --json',
    "npm run popcandy -- validate --path . --json",
  ]) {
    assert.ok(source.includes(command), `README is missing ${command}`);
  }
  assert.equal(
    publicPackages.filter((name) => source.includes(`| \`${name}\``)).length,
    9,
  );
  assert.equal(
    privateTools.filter((name) => source.includes(`| \`${name}\``)).length,
    2,
  );
  assert.match(source, /not published to npm/i);
  assert.match(source, /placeholder Figma/i);
  assert.match(source, /no remote Registry/i);
  assert.match(source, /no hosted MCP/i);
  assert.match(source, /no public model-quality claim/i);
});

test("AI-assisted case study preserves the evidence schema without inventing a model run", async () => {
  // Given: the Stage 0 publish-a-post case study.
  // When: its ordered evidence headings are read.
  const source = await readDocument("docs/AI_ASSISTED_POST_CASE_STUDY.md");
  const headings = [...source.matchAll(/^## (.+)$/gm)].map((match) => match[1]);

  // Then: the schema is exact and the absent model comparison is explicit.
  assert.deepEqual(headings, [
    "Task and acceptance criteria",
    "Fixture and exact installed versions",
    "Prompt",
    "Bounded inputs",
    "`popcandy` transcript",
    "Output diff",
    "Storybook, axe, and visual commands",
    "Model, provider, and timestamp",
    "Failures and corrections",
    "No-context comparison",
    "Reproducibility and redaction",
  ]);
  assert.ok(source.includes("Real-model comparison: not executed"));
  assert.match(
    source,
    /Stage 0 is ineligible for a public model-quality claim/,
  );
});

test("compatibility policy distinguishes pinned plans from the six executed cells", async () => {
  // Given: the public compatibility policy.
  // When: its exact pinned lanes and evidence scope are inspected.
  const source = await readDocument("docs/COMPATIBILITY.md");

  // Then: seven framework cells, five managers, and the source toolchain are fail closed.
  for (const row of [
    "vite-react-18 | Vite 8.1.0 | React 18.3.1",
    "vite-react-19 | Vite 8.1.0 | React 19.2.8",
    "next-15-react-18 | Next.js 15.5.23 | React 18.3.1",
    "next-15-react-19 | Next.js 15.5.23 | React 19.2.8",
    "next-16-react-19 | Next.js 16.3.0 | React 19.2.8",
    "react-router-7-react-18 | React Router 7.18.2 | React 18.3.1",
    "react-router-7-react-19 | React Router 7.18.2 | React 19.2.8",
    "npm-10 | npm 10.9.9",
    "npm-11 | npm 11.19.0",
    "pnpm-10 | pnpm 10.34.5",
    "pnpm-11 | pnpm 11.21.0",
    "yarn-4 | Yarn 4.18.0 | node-modules",
  ]) {
    assert.ok(source.includes(row), `Compatibility policy is missing ${row}`);
  }
  assert.match(source, /pnpm@11\.4\.0/);
  assert.match(source, /140 planned cells/);
  assert.match(source, /six executed cells/);
  assert.match(source, /tarball-only isolation/);
});

test("accessibility policy records targets and manual evidence schemas without claiming execution", async () => {
  // Given: the public accessibility policy.
  // When: its conformance target and evidence boundaries are inspected.
  const source = await readDocument("docs/ACCESSIBILITY.md");

  // Then: the standard, browser window, AT lanes, and no-claim rule remain explicit.
  assert.match(source, /WCAG 2\.2 AA/);
  assert.match(source, /latest two major versions/);
  for (const lane of [
    "VoiceOver with Safari",
    "NVDA with Chrome",
    "real iOS Safari",
  ]) {
    assert.ok(source.includes(lane), `Accessibility policy is missing ${lane}`);
  }
  assert.match(source, /Unexecuted checks are never reported as passes/);
});

test("support, security, and versioning policies keep exact pre-1.0 trust boundaries", async () => {
  // Given: the public support, security, and versioning policies.
  // When: their release commitments are read.
  const [support, security, versioning] = await Promise.all([
    readDocument("docs/SUPPORT.md"),
    readDocument("docs/SECURITY.md"),
    readDocument("docs/VERSIONING.md"),
  ]);

  // Then: every externally meaningful commitment is explicit.
  assert.match(support, /pre-1\.0 current-minor support/);
  assert.match(security, /GitHub private vulnerability reporting/);
  for (const term of [
    "ESM",
    "deprecation",
    "withdrawal",
    "prerelease",
    "coordinated public package versions",
    "external authorization",
  ]) {
    assert.match(versioning, new RegExp(term, "i"));
  }
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
