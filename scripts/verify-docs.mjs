import { readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import {
  extractRelativeMarkdownLinks,
  hasBalancedCodeFences,
} from "./lib/markdown-contract.mjs";
import { structuredTrustContractErrors } from "./lib/documentation-trust.mjs";
import {
  listFiles,
  relativePath,
  repositoryRoot,
} from "./lib/project-inspection.mjs";

const trustPaths =
  "README.md\0docs/AI_ASSISTED_POST_CASE_STUDY.md\0docs/COMPATIBILITY.md\0docs/ACCESSIBILITY.md\0docs/SUPPORT.md\0docs/SECURITY.md\0docs/VERSIONING.md\0docs/STORYBOOK_AI.md\0docs/PUBLISHING.md".split(
    "\0",
  );

export async function loadTrustContext(root) {
  const manifests = await listFiles(join(root, "packages"), (path) =>
    path.endsWith("package.json"),
  );
  const packages = [];
  for (const path of manifests) {
    if (relative(join(root, "packages"), path).split(sep).length !== 2)
      continue;
    const manifest = JSON.parse(await readFile(path, "utf8"));
    packages.push({
      name: manifest.name,
      version: manifest.version,
      private: manifest.private === true,
    });
  }
  const matrix = JSON.parse(
    await readFile(join(root, "fixtures/compatibility/matrix.json"), "utf8"),
  );
  const evidence = JSON.parse(
    await readFile(
      join(root, "docs/evidence/stage-0-compatibility-summary.json"),
      "utf8",
    ),
  );
  const names = {
    vite: "Vite",
    next: "Next.js",
    "react-router": "React Router",
  };
  return {
    publicPackages: packages.filter((entry) => !entry.private),
    privatePackages: packages.filter((entry) => entry.private),
    matrix,
    frameworkRows: Object.entries(matrix.cells).map(([id, cell]) => [
      id,
      names[cell.framework],
      cell.frameworkVersion,
      cell.reactVersion,
    ]),
    managerRows: Object.entries(matrix.managers).map(([id, manager]) => [
      id,
      manager.package,
      manager.version,
      manager.nodeLinker ?? "default",
    ]),
    evidence,
  };
}

export function trustContractErrors(documents, context) {
  const errors = structuredTrustContractErrors(documents, context);
  for (const path of trustPaths)
    if (!documents.has(path))
      errors.push(`${path}: required trust document is missing`);
  const source = documents.get("README.md");
  if (!source) return errors;
  const lines = source.trimEnd().split(/\r?\n/).length;
  if (lines < 200 || lines > 300)
    errors.push(`README.md: expected 200-300 lines, received ${lines}`);
  if ((source.match(/pnpm create vite@8\.1\.0/g) ?? []).length !== 1)
    errors.push("README.md: expected exactly one Vite quickstart");
  const claims =
    "manifest.scripts.popcandy = 'popcandy'\0manifest.devDependencies.vite = '8.1.0'\0@vitejs/plugin-react'] = '5.1.4'\0npm run popcandy -- info --path . --json\0npm run popcandy -- search \"publish post\" --path . --json\0npm run popcandy -- get social.post-composer-view --path . --json\0npm run popcandy -- compose \"publish a post with pending, success, and error states\" --path . --json\0npm run popcandy -- validate --path . --json\0pnpm test:storybook\0POSIX shell\0GitHub issues\0repository owner\0Application code still owns\0pnpm preview --host 127.0.0.1\0curl --fail --silent\0![Unpopping Candy component overview](./docs/preview/captures/unpopping-candy-overview.png)";
  for (const claim of claims.split("\0"))
    if (!source.toLowerCase().includes(claim.toLowerCase()))
      errors.push(`README.md: required claim is missing: ${claim}`);
  return errors;
}

function outside(root, target) {
  const path = relative(root, target);
  return path === ".." || path.startsWith(`..${sep}`) || isAbsolute(path);
}

export async function relativeLinkError(root, file, target) {
  const rootPath = await realpath(root);
  const filePath = await realpath(file);
  if (outside(rootPath, filePath))
    return `link source escapes repository root: ${target}`;
  const pathOnly = target.split("#")[0].split("?")[0];
  try {
    const targetPath = await realpath(
      resolve(dirname(file), decodeURIComponent(pathOnly)),
    );
    return outside(rootPath, targetPath)
      ? `link escapes repository root: ${target}`
      : undefined;
  } catch {
    return `missing relative link target ${target}`;
  }
}

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
const documents = new Map();
for (const file of [...new Set(markdownFiles)]) {
  const source = await readFile(file, "utf8");
  const label = relativePath(root, file);
  if (trustPaths.includes(label)) documents.set(label, source);
  if (!hasBalancedCodeFences(source))
    errors.push(`${label}: unbalanced fenced code block`);
  for (const target of extractRelativeMarkdownLinks(source)) {
    const error = await relativeLinkError(root, file, target);
    if (error) errors.push(`${label}: ${error}`);
  }
}
errors.push(...trustContractErrors(documents, await loadTrustContext(root)));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Documentation contracts verified across ${new Set(markdownFiles).size} Markdown files.`,
  );
}
