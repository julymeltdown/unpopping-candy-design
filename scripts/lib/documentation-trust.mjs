const executedIds =
  "base/vite-react-19/pnpm-11\0publish-post/vite-react-19/npm-10\0activity-review/vite-react-19/yarn-4\0member-moderation/vite-react-19/pnpm-11\0base/next-15-react-18/pnpm-10\0base/react-router-7-react-18/npm-11".split(
    "\0",
  );
const studyHeadings =
  "Task and acceptance criteria\0Fixture and exact installed versions\0Prompt\0Bounded inputs\0`popcandy` transcript\0Output diff\0Storybook, axe, and visual commands\0Model, provider, and timestamp\0Failures and corrections\0No-context comparison\0Reproducibility and redaction".split(
    "\0",
  );

function section(source, title) {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex(
    (line) => /^#{2,6} /.test(line) && line.replace(/^#{2,6} /, "") === title,
  );
  if (start < 0) return "";
  const level = lines[start].match(/^#+/)?.[0].length ?? 2;
  const end = lines.findIndex(
    (line, index) =>
      index > start &&
      (line.match(/^#+ /)?.[0].trim().length ?? Infinity) <= level,
  );
  return lines.slice(start + 1, end < 0 ? undefined : end).join("\n");
}

function table(source, title) {
  const rows = section(source, title)
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim().replaceAll("`", "")),
    );
  return rows.length < 2
    ? []
    : rows.slice(2).filter((row) => row.some(Boolean));
}

const sorted = (rows) =>
  rows.sort((a, b) => a.join("\0").localeCompare(b.join("\0")));
const sameRows = (actual, expected) =>
  JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected));
const packageRows = (packages) =>
  packages.map(({ name, version }) => [name, version]);

function requireClaims(errors, path, source, claims) {
  for (const claim of claims.split("\0")) {
    if (!source.toLowerCase().includes(claim.toLowerCase())) {
      errors.push(`${path}: required claim is missing: ${claim}`);
    }
  }
}

const reject = (errors, condition, message) => {
  if (condition) errors.push(message);
};

function checkReadme(errors, source, context) {
  if (context) {
    const publicRows = table(source, "Public package candidates").map((row) =>
      row.slice(0, 2),
    );
    const privateRows = table(source, "Private tooling").map((row) =>
      row.slice(0, 2),
    );
    reject(
      errors,
      !sameRows(publicRows, packageRows(context.publicPackages)),
      "README.md: public package table mismatch",
    );
    reject(
      errors,
      !sameRows(privateRows, packageRows(context.privatePackages)),
      "README.md: private package table mismatch",
    );
    for (const { name, version } of context.publicPackages) {
      const tarball = `file:./packs/${name.replace("@unpopping-candy/", "unpopping-candy-")}-${version}.tgz`;
      if (!source.includes(tarball)) {
        errors.push(
          `README.md: quickstart is missing local dependency ${tarball}`,
        );
      }
    }
  }
  const limitations = section(source, "Current limitations");
  requireClaims(
    errors,
    "README.md#Current limitations",
    limitations,
    "not published to npm\0placeholder Figma mappings\0There is no remote Registry\0There is no hosted MCP service\0no public model-quality claim",
  );
  for (const contradiction of [
    /(?<!not )published to npm/i,
    /remote Registry is available/i,
    /hosted MCP service is available/i,
    /makes a public model-quality claim/i,
  ])
    reject(
      errors,
      contradiction.test(limitations),
      `README.md: contradictory limitation: ${contradiction}`,
    );
}

function evidenceIsExact(context) {
  const { evidence, matrix } = context;
  if (
    evidence.schemaVersion !== 1 ||
    evidence.sourceCommit !== "616c55c7683392cc56c9798e875783dc32382ed3" ||
    evidence.runner !== "scripts/run-compatibility-matrix.mjs" ||
    evidence.matrix !== "fixtures/compatibility/matrix.json" ||
    evidence.plannedCells !== 140 ||
    evidence.executedCells !== 6 ||
    evidence.unexecutedCells !== 134
  )
    return false;
  if (
    !sameRows(
      evidence.runs.map((run) => [run.id]),
      executedIds.map((id) => [id]),
    )
  )
    return false;
  return evidence.runs.every((run) => {
    const [, cellId, managerId] = run.id.split("/");
    const cell = matrix.cells[cellId];
    const manager = matrix.managers[managerId];
    return (
      run.status === "passed" &&
      run.manager === `${manager.package}@${manager.version}` &&
      run.framework === `${cell.framework}@${cell.frameworkVersion}` &&
      run.react === cell.reactVersion &&
      run.typescript === "5.7.3" &&
      run.browser === "chromium@151.0.7922.34"
    );
  });
}

function checkCompatibility(errors, source, context) {
  if (!context) return;
  reject(
    errors,
    !sameRows(
      table(source, "Framework and React matrix"),
      context.frameworkRows,
    ),
    "COMPATIBILITY: framework table mismatch",
  );
  reject(
    errors,
    !sameRows(table(source, "Package-manager matrix"), context.managerRows),
    "COMPATIBILITY: manager table mismatch",
  );
  const expected = context.evidence.runs.map((run) => [run.id, run.status]);
  reject(
    errors,
    !sameRows(table(source, "Planned versus executed"), expected),
    "COMPATIBILITY: executed rows mismatch",
  );
  reject(
    errors,
    !evidenceIsExact(context),
    "compatibility evidence summary is invalid",
  );
  requireClaims(
    errors,
    "docs/COMPATIBILITY.md",
    source,
    "140 planned cells\0exactly six executed cells\0remaining 134 planned combinations were not executed\0tarball-only isolation\0pnpm@11.4.0\0./evidence/stage-0-compatibility-summary.json",
  );
}

export function structuredTrustContractErrors(documents, context) {
  const errors = [];
  if (documents.has("README.md"))
    checkReadme(errors, documents.get("README.md"), context);
  if (documents.has("docs/COMPATIBILITY.md"))
    checkCompatibility(errors, documents.get("docs/COMPATIBILITY.md"), context);
  const study = documents.get("docs/AI_ASSISTED_POST_CASE_STUDY.md");
  if (study) {
    const headings = [...study.matchAll(/^## (.+)$/gm)].map(
      (match) => match[1],
    );
    reject(
      errors,
      headings.join("\n") !== studyHeadings.join("\n"),
      "case study: heading order mismatch",
    );
    reject(
      errors,
      context &&
        !sameRows(
          table(study, "Fixture and exact installed versions"),
          packageRows(context.publicPackages),
        ),
      "case study: package versions mismatch",
    );
    requireClaims(
      errors,
      "docs/AI_ASSISTED_POST_CASE_STUDY.md",
      study,
      "Real-model comparison: not executed\0Stage 0 is ineligible for a public model-quality claim\0failure recovery is UNPROVEN\0does not validate invented props\0zero errors and zero warnings",
    );
  }
  const support = documents.get("docs/SUPPORT.md") ?? "";
  requireClaims(
    errors,
    "docs/SUPPORT.md",
    support,
    "pre-1.0 current-minor support\0there is currently no supported published minor",
  );
  reject(
    errors,
    /all old minor lines receive fixes indefinitely|every old minor is supported/i.test(
      support,
    ),
    "SUPPORT: indefinite old-minor claim",
  );
  requireClaims(
    errors,
    "docs/ACCESSIBILITY.md",
    documents.get("docs/ACCESSIBILITY.md") ?? "",
    "WCAG 2.2 AA\0latest two major versions\0VoiceOver with Safari\0NVDA with Chrome\0real iOS Safari\0Unexecuted checks are never reported as passes",
  );
  requireClaims(
    errors,
    "docs/SECURITY.md",
    documents.get("docs/SECURITY.md") ?? "",
    "GitHub private vulnerability reporting\0https://github.com/julymeltdown/unpopping-candy-design/security/advisories/new",
  );
  requireClaims(
    errors,
    "docs/VERSIONING.md",
    documents.get("docs/VERSIONING.md") ?? "",
    "ESM-only\0deprecation\0withdrawal\0Prerelease\0coordinated public package versions\0No published minor exists today\0repository issue or pull request",
  );
  const storybook = documents.get("docs/STORYBOOK_AI.md") ?? "";
  reject(
    errors,
    !storybook.includes("pnpm test:storybook") ||
      storybook.includes("test-storybook"),
    "STORYBOOK_AI: root test command mismatch",
  );
  const publishing = documents.get("docs/PUBLISHING.md") ?? "";
  requireClaims(
    errors,
    "docs/PUBLISHING.md",
    publishing,
    "All nine public packages use one coordinated requested version\0private tooling packages are not publication targets",
  );
  reject(
    errors,
    /versioned independently from visual packages/i.test(publishing),
    "PUBLISHING: independent public versions",
  );
  return errors;
}
