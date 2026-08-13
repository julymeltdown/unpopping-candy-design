import {
  availabilityClaimErrors,
  supportClaimErrors,
} from "./documentation-claims.mjs";
const studyHeadings =
  "Task and acceptance criteria\0Fixture and exact installed versions\0Prompt\0Bounded inputs\0`popcandy` transcript\0Output diff\0Storybook, axe, and visual commands\0Model, provider, and timestamp\0Failures and corrections\0No-context comparison\0Reproducibility and redaction".split(
    "\0",
  );
const sorted = (rows) =>
  rows.sort((a, b) => a.join("\0").localeCompare(b.join("\0")));
const sameRows = (actual, expected) =>
  JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected));
const packageRows = (packages) =>
  packages.map(({ name, version }) => [name, version]);
const prose = (source) =>
  source
    .replace(/<!--[^]*?-->/g, "")
    .replace(/^(```|~~~)[^\n]*\n[^]*?^\1\s*$/gm, "");

function section(source, title) {
  const lines = source.split(/\r?\n/);
  const headings = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => /^#{2,6} /.test(line));
  const match = headings.filter(
    ({ line }) => line.replace(/^#{2,6} /, "") === title,
  );
  if (match.length !== 1) return { body: "", count: match.length };
  const { line, index } = match[0];
  const level = line.match(/^#+/)[0].length;
  const next = headings.find(
    (heading) =>
      heading.index > index && heading.line.match(/^#+/)[0].length <= level,
  );
  return {
    body: lines.slice(index + 1, next?.index).join("\n"),
    count: 1,
  };
}

function table(source, title) {
  const rows = section(source, title)
    .body.split(/\r?\n/)
    .filter((line) => line.trim().startsWith("|"))
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim().replaceAll("`", "")),
    );
  return rows.slice(2).filter((row) => row.some(Boolean));
}

function claims(errors, path, source, required, forbidden = []) {
  const visible = prose(source);
  for (const claim of required.split("\0"))
    if (!visible.toLowerCase().includes(claim.toLowerCase()))
      errors.push(`${path}: required claim is missing: ${claim}`);
  for (const pattern of forbidden)
    if (pattern.test(visible))
      errors.push(`${path}: forbidden claim: ${pattern}`);
}

function unique(errors, path, source, titles) {
  for (const title of titles)
    if (section(source, title).count !== 1)
      errors.push(`${path}: expected one ${title} heading`);
}

function checkReadme(errors, source, context) {
  unique(errors, "README.md", source, [
    "Public package candidates",
    "Private tooling",
    "Current limitations",
  ]);
  if (context) {
    for (const [title, expected] of [
      ["Public package candidates", context.publicPackages],
      ["Private tooling", context.privatePackages],
    ])
      if (
        !sameRows(
          table(source, title).map((row) => row.slice(0, 2)),
          packageRows(expected),
        )
      )
        errors.push(`README.md: ${title.toLowerCase()} table mismatch`);
  }
  claims(
    errors,
    "README.md#Current limitations",
    section(source, "Current limitations").body,
    "not published to npm\0placeholder Figma mappings\0There is no remote Registry\0There is no hosted MCP service\0no public model-quality claim",
  );
  claims(errors, "README.md", source, "", [
    /(?:remote|cloud|hosted)[^.\n]*Registry[^.\n]*(?:available|ready|operat(?:e|ing)|live)/i,
    /(?:hosted|web|remote)[^.\n]*MCP[^.\n]*(?:available|ready|operat(?:e|ing)|live)|operat(?:e|ing)[^.\n]*MCP[^.\n]*(?:web|remote|hosted)/i,
    /makes a public model-quality claim/i,
  ]);
  errors.push(...availabilityClaimErrors("README.md", source));
}

function checkCompatibility(errors, source, context) {
  if (!context) return;
  unique(errors, "docs/COMPATIBILITY.md", source, [
    "Framework and React matrix",
    "Package-manager matrix",
    "Planned versus executed",
  ]);
  const names = {
    vite: "Vite",
    next: "Next.js",
    "react-router": "React Router",
  };
  const frameworkRows = Object.entries(context.historicalMatrix.cells).map(
    ([id, cell]) => [
      id,
      names[cell.framework],
      cell.frameworkVersion,
      cell.reactVersion,
    ],
  );
  const managerRows = Object.entries(context.historicalMatrix.managers).map(
    ([id, manager]) => [
      id,
      manager.package,
      manager.version,
      manager.nodeLinker ?? "default",
    ],
  );
  for (const [title, expected] of [
    ["Framework and React matrix", frameworkRows],
    ["Package-manager matrix", managerRows],
    [
      "Planned versus executed",
      context.evidence.runs.map((run) => [run.id, run.status]),
    ],
  ])
    if (!sameRows(table(source, title), expected))
      errors.push(`COMPATIBILITY: ${title.toLowerCase()} mismatch`);
  if (!context.evidenceIsExact(context.evidence))
    errors.push("compatibility evidence summary is invalid");
  claims(
    errors,
    "docs/COMPATIBILITY.md",
    source,
    "140 planned cells\0All 140 executed cells passed\0tarball-only isolation\0pnpm@11.4.0\0./evidence/stage-0-compatibility-summary.json",
  );
}

export function structuredTrustContractErrors(documents, context) {
  const errors = [];
  const readme = documents.get("README.md");
  const compatibility = documents.get("docs/COMPATIBILITY.md");
  if (readme) checkReadme(errors, readme, context);
  if (compatibility) checkCompatibility(errors, compatibility, context);
  const study = documents.get("docs/AI_ASSISTED_POST_CASE_STUDY.md");
  if (study) {
    const headings = [...study.matchAll(/^## (.+)$/gm)].map(
      (match) => match[1],
    );
    if (headings.join("\n") !== studyHeadings.join("\n"))
      errors.push("case study: heading order mismatch");
    if (
      context &&
      !sameRows(
        table(study, "Fixture and exact installed versions"),
        packageRows(context.historicalPublicPackages),
      )
    )
      errors.push("case study: package versions mismatch");
    claims(
      errors,
      "docs/AI_ASSISTED_POST_CASE_STUDY.md",
      study,
      "Real-model comparison: not executed\0Stage 0 is ineligible for a public model-quality claim\0failure recovery is UNPROVEN\0does not validate invented props\0zero errors and zero warnings",
      [
        /validator (?:enforces|validates)[^.\n]*(?:required )?(?:component )?props/i,
      ],
    );
  }
  const rules = [
    [
      "docs/SUPPORT.md",
      "pre-1.0 current-minor support\0there is currently no supported published minor",
      [
        /all old minor lines receive fixes indefinitely/i,
        /every old minor is supported/i,
        /old minor lines receive fixes for (?:one year|12 months)/i,
        /(?:each|every|all)[^.\n]*(?:prior|old)[^.\n]*minor[^.\n]*(?:maintenance|fixes|support)[^.\n]*(?:twelve months|12 months|one year)/i,
      ],
    ],
    [
      "docs/ACCESSIBILITY.md",
      "WCAG 2.2 AA\0latest two major versions\0VoiceOver with Safari\0NVDA with Chrome\0real iOS Safari\0Unexecuted checks are never reported as passes",
    ],
    [
      "docs/SECURITY.md",
      "GitHub private vulnerability reporting\0https://github.com/julymeltdown/unpopping-candy-design/security/advisories/new",
    ],
    [
      "docs/VERSIONING.md",
      "ESM-only\0deprecation\0withdrawal\0Prerelease\0coordinated public package versions\0No published minor exists today\0repository issue or pull request",
    ],
    [
      "docs/PUBLISHING.md",
      "All nine public packages use one coordinated requested version\0private tooling packages are not publication targets",
      [
        /public packages[^.\n]*versioned independently|public packages may be versioned independently/i,
      ],
    ],
  ];
  for (const [path, required, forbidden] of rules)
    claims(errors, path, documents.get(path) ?? "", required, forbidden);
  errors.push(
    ...supportClaimErrors(
      "docs/SUPPORT.md",
      documents.get("docs/SUPPORT.md") ?? "",
    ),
  );
  const storybook = documents.get("docs/STORYBOOK_AI.md") ?? "";
  if (
    !storybook.includes("pnpm test:storybook") ||
    storybook.includes("test-storybook")
  )
    errors.push("STORYBOOK_AI: root test command mismatch");
  return errors;
}
