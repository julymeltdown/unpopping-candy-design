const negativeWords = new Set([
  "cannot",
  "local",
  "locally",
  "no",
  "not",
  "none",
  "only",
  "unavailable",
  "unexecuted",
  "unpublished",
  "unsupported",
  "without",
]);
const noiseWords = new Set([
  "a",
  "all",
  "an",
  "and",
  "are",
  "be",
  "can",
  "every",
  "for",
  "from",
  "full",
  "get",
  "is",
  "nine",
  "now",
  "of",
  "on",
  "one",
  "over",
  "public",
  "the",
  "to",
  "twelve",
  "we",
  "with",
]);
const remoteWords = new Set([
  "cloud",
  "endpoint",
  "external",
  "hosted",
  "internet",
  "network",
  "online",
  "remote",
  "server",
  "web",
]);
const availableWords = new Set([
  "accessible",
  "available",
  "carries",
  "installable",
  "installed",
  "live",
  "operate",
  "operates",
  "operating",
  "published",
  "ready",
  "reach",
  "reachable",
  "running",
]);
const supportWords = new Set([
  "fix",
  "fixes",
  "maintenance",
  "maintained",
  "support",
  "supported",
]);
const oldWords = new Set(["old", "older", "past", "previous", "prior"]);

const has = (tokens, words) => tokens.some((token) => words.has(token));

function visibleProse(source) {
  return source
    .replace(/<!--[^]*?-->/g, "")
    .replace(/^(```|~~~)[^\n]*\n[^]*?^\1\s*$/gm, "")
    .replace(/^\s*\|.*\|\s*$/gm, "");
}

function statements(source) {
  return visibleProse(source)
    .split(/(?<=[.!?])(?:\s+|$)|\n+/)
    .flatMap((line) =>
      line
        .replace(/^\s*(?:#{1,6}|[-*]>?)\s+/, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[`*_]/g, "")
        .split(/\s*(?:;|,?\s+but\s+|,?\s+however\s+|,?\s+yet\s+)\s*/i)
        .map((clause) => clause.trim()),
    )
    .filter(Boolean);
}

function tokens(statement) {
  return statement.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function positive(statement) {
  const words = tokens(statement);
  return !words.some((word) => negativeWords.has(word));
}

function report(errors, path, statement, family) {
  errors.push(`${path}: forbidden ${family} claim: ${statement}`);
}

export function availabilityClaimErrors(path, source) {
  const errors = [];
  for (const statement of statements(source)) {
    const words = tokens(statement);
    const meaningful = words.filter((word) => !noiseWords.has(word));
    if (!positive(statement)) continue;
    if (
      words.includes("npm") &&
      (has(words, availableWords) ||
        meaningful.some((word) =>
          ["package", "packages", "candidate", "candidates"].includes(word),
        ))
    )
      report(errors, path, statement, "npm availability");
    for (const subject of ["registry", "mcp"]) {
      if (
        words.includes(subject) &&
        has(words, remoteWords) &&
        has(words, availableWords)
      )
        report(errors, path, statement, `remote ${subject}`);
    }
  }
  return errors;
}

export function supportClaimErrors(path, source) {
  const errors = [];
  for (const statement of statements(source)) {
    const words = tokens(statement);
    if (
      positive(statement) &&
      words.some((word) => oldWords.has(word)) &&
      words.some((word) => word === "minor" || word === "minors") &&
      has(words, supportWords)
    )
      report(errors, path, statement, "old-minor support window");
  }
  return errors;
}
