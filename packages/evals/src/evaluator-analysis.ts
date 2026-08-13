import type { KnowledgeCatalog } from "@unpopping-candy/knowledge";
import type { EvaluationFinding } from "./types.ts";
import { lineOf, parseNamedImports } from "./evaluator-import-analysis.ts";

export {
  findInvalidImports,
  normalizePath,
} from "./evaluator-import-analysis.ts";
export { findUnknownProps } from "./evaluator-prop-analysis.ts";

export function findHardcodedVisualValues(
  filePath: string,
  source: string,
): EvaluationFinding[] {
  const findings: EvaluationFinding[] = [];
  const candidates: Array<{ code: string; pattern: RegExp; message: string }> =
    [
      {
        code: "hardcoded-color",
        pattern: /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|hsl)a?\([^)]*\)/g,
        message:
          "Use a Unpopping Candy semantic color token instead of a literal color.",
      },
      {
        code: "hardcoded-spacing",
        pattern:
          /\b(?:padding|margin|gap|rowGap|columnGap|borderRadius)\s*:\s*['"](?:-?\d+(?:\.\d+)?)(?:px|rem|em)['"]/g,
        message:
          "Use a Unpopping Candy spacing or radius token instead of a literal visual value.",
      },
      {
        code: "hardcoded-shadow",
        pattern: /\b(?:boxShadow|filter|backdropFilter)\s*:\s*['"][^'"]+['"]/g,
        message: "Use a documented elevation or surface treatment.",
      },
      {
        code: "generic-gradient",
        pattern: /(?:linear|radial)-gradient\s*\(/g,
        message:
          "Unspecified gradients are not part of the Unpopping Candy visual contract.",
      },
    ];
  for (const candidate of candidates) {
    for (const match of source.matchAll(candidate.pattern)) {
      const evidence = match[0] ?? "";
      if (evidence.includes("var(--popcandy-")) continue;
      findings.push({
        code: candidate.code,
        severity: "error",
        path: filePath,
        message: candidate.message,
        evidence: `line ${lineOf(source, match.index ?? 0)}: ${evidence}`,
      });
    }
  }
  return findings;
}

function visibleText(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]*\}/g, " ")
    .replace(/&[A-Za-z0-9#]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findAccessibilityIssues(
  filePath: string,
  source: string,
): EvaluationFinding[] {
  const findings: EvaluationFinding[] = [];
  for (const match of source.matchAll(
    /<button\b([^>]*)>([\s\S]*?)<\/button>/g,
  )) {
    const attributes = match[1] ?? "";
    const content = visibleText(match[2] ?? "");
    if (
      /aria-label\s*=|aria-labelledby\s*=|title\s*=/.test(attributes) ||
      /[A-Za-z0-9가-힣]/.test(content)
    )
      continue;
    findings.push({
      code: "unnamed-button",
      severity: "error",
      path: filePath,
      message: "Button controls require a visible or accessible name.",
      evidence: `line ${lineOf(source, match.index ?? 0)}`,
    });
  }
  for (const match of source.matchAll(/<img\b([^>]*)>/g)) {
    if (/\balt\s*=/.test(match[1] ?? "")) continue;
    findings.push({
      code: "missing-alt",
      severity: "error",
      path: filePath,
      message:
        'Images require an alt attribute, including alt="" when decorative.',
      evidence: `line ${lineOf(source, match.index ?? 0)}`,
    });
  }
  for (const match of source.matchAll(/<(input|textarea|select)\b([^>]*)>/g)) {
    const attributes = match[2] ?? "";
    if (/aria-label\s*=|aria-labelledby\s*=|\bid\s*=/.test(attributes))
      continue;
    findings.push({
      code: "unnamed-field",
      severity: "error",
      path: filePath,
      message: `Raw ${match[1]} controls require a programmatic label.`,
      evidence: `line ${lineOf(source, match.index ?? 0)}`,
    });
  }
  return findings;
}

export function stateIsCovered(state: string, source: string): boolean {
  const normalized = state.toLowerCase();
  const patterns: Readonly<Record<string, RegExp>> = {
    loading: /\bloading\b|<Spinner\b|<Skeleton\b/i,
    error: /\berror\b|<Alert\b[^>]*\btone\s*=\s*['"](?:critical|warning)['"]/i,
    empty: /<EmptyState\b|\blength\s*===\s*0\b|\bno\s+[a-z]+/i,
    disabled: /\bdisabled\b/i,
    pending: /\bpending\b/i,
    success: /\bsuccess\b|\btone\s*=\s*['"]success['"]/i,
    offline: /\boffline\b/i,
  };
  return (
    patterns[normalized]?.test(source) ??
    new RegExp(
      `\\b${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "i",
    ).test(source)
  );
}

export function componentUsage(
  catalog: KnowledgeCatalog,
  source: string,
): { popcandy: number; total: number; ids: readonly string[] } {
  const imports = parseNamedImports(source, catalog);
  const popcandyNames = new Set(
    imports.filter((entry) => entry.doc).map((entry) => entry.localName),
  );
  const tags = [...source.matchAll(/<([A-Z][A-Za-z0-9.]*)\b/g)].map(
    (match) => match[1] ?? "",
  );
  let popcandy = 0;
  const ids = new Set<string>();
  const byLocalName = new Map(
    imports
      .filter((entry) => entry.doc)
      .map((entry) => [entry.localName, entry.doc?.id] as const),
  );
  for (const tag of tags) {
    const rootTag = tag.split(".")[0] ?? tag;
    if (!popcandyNames.has(rootTag)) continue;
    popcandy += 1;
    const id = byLocalName.get(rootTag);
    if (id) ids.add(id);
  }
  return { popcandy, total: tags.length, ids: [...ids].sort() };
}

export function bounded(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}
