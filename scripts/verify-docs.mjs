import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import {
  extractRelativeMarkdownLinks,
  hasBalancedCodeFences,
} from "./lib/markdown-contract.mjs";
import { structuredTrustContractErrors } from "./lib/documentation-trust.mjs";
import {
  historicalJson,
  historicalRunnerDigest,
} from "./lib/historical-evidence.mjs";
import {
  approvedTrustDocumentErrors,
  trustPaths,
} from "./lib/documentation-policy.mjs";
import {
  listFiles,
  relativePath,
  repositoryRoot,
} from "./lib/project-inspection.mjs";

const execFileAsync = promisify(execFile);
const executedIds =
  "base/vite-react-19/pnpm-11\0publish-post/vite-react-19/npm-10\0activity-review/vite-react-19/yarn-4\0member-moderation/vite-react-19/pnpm-11\0base/next-15-react-18/pnpm-10\0base/react-router-7-react-18/npm-11".split(
    "\0",
  );
const retainedRunsDigest =
  "13760a3f53649e3ef57e2f588072cf50d745766d55fb603817db81ed8768bffc";
function evidenceValidator(matrix, packages, sourceCommit, runnerDigest) {
  const tarballNames = packages.map(({ name, version }) => [
    name,
    `unpopping-candy-${name.split("/")[1]}-${version}.tgz`,
  ]);
  return (evidence) => {
    // prettier-ignore
    const headerKeys = "schemaVersion,sourceCommit,runnerDigest,runner,matrix,plannedCells,executedCells,unexecutedCells,runs";
    // Six exact scalar assertions remain readable as one bounded tuple.
    // prettier-ignore
    const headerValues = [evidence.schemaVersion === 2, evidence.sourceCommit === sourceCommit, evidence.runnerDigest === runnerDigest, evidence.runner === "scripts/run-compatibility-matrix.mjs", evidence.matrix === "fixtures/compatibility/matrix.json", evidence.plannedCells === 140, evidence.executedCells === 6, evidence.unexecutedCells === 134];
    // prettier-ignore
    const ids = evidence.runs.map(({ id }) => id).sort().join();
    // prettier-ignore
    const digest = createHash("sha256").update(JSON.stringify(evidence.runs)).digest("hex");
    if (
      Object.keys(evidence).join() !== headerKeys ||
      headerValues.includes(false) ||
      ids !== [...executedIds].sort().join() ||
      digest !== retainedRunsDigest
    )
      return false;
    return evidence.runs.every((run) => {
      const [scenario, cellId, managerId] = run.id.split("/");
      const cell = matrix.cells[cellId];
      const manager = matrix.managers[managerId];
      const label = scenario.replace(/(^|-)(.)/g, (_, separator, letter) =>
        separator ? ` ${letter}` : letter.toUpperCase(),
      );
      const runKeys =
        "id,status,node,manager,framework,react,typescript,browser,tarballs,stages,isolation,resultLocator,resultLocatorStatus";
      // Ordered actual/expected pairs make the retained evidence fields explicit.
      // prettier-ignore
      const pairs = [[run.status, "passed"], [run.node, "v22.16.0"], [run.manager.id, managerId], [run.manager.package, manager.package], [run.manager.version, manager.version], [run.framework.id, cellId], [run.framework.name, cell.framework], [run.framework.version, cell.frameworkVersion], [run.react, cell.reactVersion], [run.typescript, "5.7.3"], [run.browser.name, "chromium"], [run.browser.version, "151.0.7922.34"], [run.browser.expectedAccessibleName, `${label} compatibility fixture`], [run.resultLocator, null], [run.resultLocatorStatus, "ignored artifact locator unavailable"]];
      const stages =
        Object.values(run.stages).join() === "passed,passed,passed,passed";
      const isolation =
        Object.values(run.isolation).join() === "true,true,false,false";
      const names = run.tarballs
        .map(({ packageName, name }) => [packageName, name])
        .sort()
        .join();
      return (
        Object.keys(run).join() === runKeys &&
        pairs.every(([actual, expected]) => actual === expected) &&
        Object.keys(run.stages).join() === "install,typecheck,build,smoke" &&
        stages &&
        Object.keys(run.isolation).join() ===
          "temporaryRootOutsideWorkspace,tarballOnlyPublicPackages,workspaceAliases,privateImportPaths" &&
        isolation &&
        names === [...tarballNames].sort().join() &&
        run.tarballs.every(
          (entry) =>
            Object.keys(entry).join() === "packageName,name,sha256" &&
            /^[0-9a-f]{64}$/.test(entry.sha256),
        )
      );
    });
  };
}

export async function loadTrustContext(root, suppliedEvidence) {
  // prettier-ignore
  const manifests = await listFiles(join(root, "packages"), (path) => path.endsWith("package.json"));
  const packages = [];
  for (const path of manifests) {
    if (relative(join(root, "packages"), path).split(sep).length !== 2)
      continue;
    const manifest = JSON.parse(await readFile(path, "utf8"));
    packages.push({
      name: manifest.name,
      version: manifest.version,
      private: manifest.private === true,
      path: relative(root, path),
    });
  }
  const evidence =
    suppliedEvidence ??
    JSON.parse(
      await readFile(
        join(root, "docs/evidence/stage-0-compatibility-summary.json"),
        "utf8",
      ),
    );
  if (!/^[0-9a-f]{40}$/.test(evidence.sourceCommit))
    throw new Error("compatibility evidence sourceCommit must be a full SHA");
  await execFileAsync(
    "git",
    ["merge-base", "--is-ancestor", evidence.sourceCommit, "HEAD"],
    { cwd: root, encoding: "utf8", maxBuffer: 1024, timeout: 5000 },
  );
  const historicalMatrix = await historicalJson(
    root,
    evidence.sourceCommit,
    "fixtures/compatibility/matrix.json",
  );
  const historicalPackages = await Promise.all(
    packages.map(({ path }) =>
      historicalJson(root, evidence.sourceCommit, path),
    ),
  );
  const runnerDigest = await historicalRunnerDigest(
    root,
    evidence.sourceCommit,
  );
  return {
    publicPackages: packages
      .filter((entry) => !entry.private)
      .map(({ name, version, private: isPrivate }) => ({
        name,
        version,
        private: isPrivate,
      })),
    privatePackages: packages
      .filter((entry) => entry.private)
      .map(({ name, version, private: isPrivate }) => ({
        name,
        version,
        private: isPrivate,
      })),
    historicalPublicPackages: historicalPackages
      .filter((entry) => entry.private !== true)
      .map(({ name, version, private: isPrivate }) => ({
        name,
        version,
        private: isPrivate === true,
      })),
    evidenceIsExact: evidenceValidator(
      historicalMatrix,
      historicalPackages.filter((entry) => entry.private !== true),
      evidence.sourceCommit,
      runnerDigest,
    ),
    historicalMatrix,
    evidence,
  };
}

export function trustContractErrors(documents, context) {
  const errors = [
    ...structuredTrustContractErrors(documents, context),
    ...approvedTrustDocumentErrors(documents),
  ];
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
const markdown = (path) => path.endsWith(".md");
const readme = (path) => path.endsWith("README.md");
const markdownFiles = [
  join(root, "README.md"),
  join(root, "DESIGN.md"),
  ...(await listFiles(join(root, "docs"), markdown)),
  ...(await listFiles(join(root, "packages"), readme)),
  ...(await listFiles(join(root, "skills"), markdown)),
  ...(await listFiles(join(root, "agent/components"), markdown)),
  ...(await listFiles(join(root, "agent/patterns"), markdown)),
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
