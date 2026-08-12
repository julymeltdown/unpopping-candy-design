import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import {
  extractRelativeMarkdownLinks,
  hasBalancedCodeFences,
} from "./lib/markdown-contract.mjs";
import {
  listFiles,
  relativePath,
  repositoryRoot,
} from "./lib/project-inspection.mjs";

const root = repositoryRoot();
const markdownFiles = [
  join(root, "README.md"),
  join(root, "DESIGN.md"),
  ...(await listFiles(join(root, "docs"), (path) => path.endsWith(".md"))),
  ...(await listFiles(join(root, "packages"), (path) =>
    path.endsWith("README.md"),
  )),
  ...(await listFiles(join(root, "skills"), (path) => path.endsWith(".md"))),
  ...(await listFiles(join(root, "agent/components"), (path) =>
    path.endsWith(".md"),
  )),
  ...(await listFiles(join(root, "agent/patterns"), (path) =>
    path.endsWith(".md"),
  )),
];
const errors = [];
const trustDocuments = new Map();

const requiredTrustDocuments = [
  "README.md",
  "docs/AI_ASSISTED_POST_CASE_STUDY.md",
  "docs/COMPATIBILITY.md",
  "docs/ACCESSIBILITY.md",
  "docs/SUPPORT.md",
  "docs/SECURITY.md",
  "docs/VERSIONING.md",
];

const requiredClaims = new Map([
  [
    "README.md",
    [
      "npm run popcandy -- info --path . --json",
      'npm run popcandy -- search "publish post" --path . --json',
      "npm run popcandy -- get social.post-composer-view --path . --json",
      'npm run popcandy -- compose "publish a post with pending, success, and error states" --path . --json',
      "npm run popcandy -- validate --path . --json",
      "not published to npm",
      "placeholder Figma mappings",
      "no remote Registry",
      "no hosted MCP",
      "no public model-quality claim",
      "Application code still owns",
      "Stage 1 plans",
      "Stage 2 plans",
      "Stage 3 plans",
      "./docs/AI_ASSISTED_POST_CASE_STUDY.md",
      "./docs/COMPATIBILITY.md",
      "./docs/ACCESSIBILITY.md",
      "./docs/SUPPORT.md",
      "./docs/SECURITY.md",
      "./docs/VERSIONING.md",
      "./docs/COMPONENT_GUIDELINES.md",
    ],
  ],
  [
    "docs/AI_ASSISTED_POST_CASE_STUDY.md",
    [
      "Real-model comparison: not executed",
      "Stage 0 is ineligible for a public model-quality claim",
    ],
  ],
  [
    "docs/COMPATIBILITY.md",
    [
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
      "pnpm@11.4.0",
      "140 planned cells",
      "six executed cells",
      "tarball-only isolation",
    ],
  ],
  [
    "docs/ACCESSIBILITY.md",
    [
      "WCAG 2.2 AA",
      "latest two major versions",
      "VoiceOver with Safari",
      "NVDA with Chrome",
      "real iOS Safari",
      "Unexecuted checks are never reported as passes",
    ],
  ],
  ["docs/SUPPORT.md", ["pre-1.0 current-minor support"]],
  [
    "docs/SECURITY.md",
    [
      "GitHub private vulnerability reporting",
      "https://github.com/julymeltdown/unpopping-candy-design/security/advisories/new",
    ],
  ],
  [
    "docs/VERSIONING.md",
    [
      "ESM",
      "deprecation",
      "withdrawal",
      "prerelease",
      "coordinated public package versions",
      "external authorization",
    ],
  ],
]);

export function trustContractErrors(documents) {
  const contractErrors = [];
  for (const path of requiredTrustDocuments) {
    const source = documents.get(path);
    if (source === undefined) {
      contractErrors.push(`${path}: required trust document is missing`);
      continue;
    }
    if (path === "README.md") {
      const lineCount = source.trimEnd().split(/\r?\n/).length;
      if (lineCount < 200 || lineCount > 300) {
        contractErrors.push(
          `README.md: expected 200-300 lines, received ${lineCount}`,
        );
      }
      const packageRows = [
        ...source.matchAll(/^\| `(@unpopping-candy\/[^`]+)`\s+\|/gm),
      ].map((match) => match[1]);
      if (packageRows.length !== 11 || new Set(packageRows).size !== 11) {
        contractErrors.push(
          "README.md: expected exactly nine public and two private package rows",
        );
      }
      if ((source.match(/pnpm create vite@8\.1\.0/g) ?? []).length !== 1) {
        contractErrors.push("README.md: expected exactly one Vite quickstart");
      }
    }
    if (path === "docs/AI_ASSISTED_POST_CASE_STUDY.md") {
      const headings = [...source.matchAll(/^## (.+)$/gm)].map(
        (match) => match[1],
      );
      const expectedHeadings = [
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
      ];
      if (headings.join("\n") !== expectedHeadings.join("\n")) {
        contractErrors.push(
          `${path}: evidence headings are missing or out of order`,
        );
      }
    }
    for (const claim of requiredClaims.get(path) ?? []) {
      if (!source.toLowerCase().includes(claim.toLowerCase())) {
        contractErrors.push(`${path}: required claim is missing: ${claim}`);
      }
    }
  }
  return contractErrors;
}

for (const file of [...new Set(markdownFiles)]) {
  const source = await readFile(file, "utf8");
  const label = relativePath(root, file);
  if (requiredTrustDocuments.includes(label)) trustDocuments.set(label, source);

  if (!hasBalancedCodeFences(source)) {
    errors.push(`${label}: unbalanced fenced code block`);
  }

  for (const target of extractRelativeMarkdownLinks(source)) {
    const pathOnly = target.split("#")[0].split("?")[0];
    if (!pathOnly) continue;
    const resolved = resolve(dirname(file), decodeURIComponent(pathOnly));
    if (!resolved.startsWith(root)) {
      errors.push(`${label}: link escapes repository root: ${target}`);
      continue;
    }
    try {
      await access(resolved);
    } catch {
      errors.push(`${label}: missing relative link target ${target}`);
    }
  }
}

errors.push(...trustContractErrors(trustDocuments));

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Documentation contracts verified across ${new Set(markdownFiles).size} Markdown files.`,
);
