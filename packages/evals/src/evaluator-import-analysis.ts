import type {
  ComponentDoc,
  KnowledgeCatalog,
} from "@unpopping-candy/knowledge";
import type { EvaluationFinding } from "./types.ts";

export interface ImportedComponent {
  exportedName: string;
  localName: string;
  entrypoint: string;
  doc?: ComponentDoc;
}

export function lineOf(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

export function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
}

function entrypointSet(catalog: KnowledgeCatalog): Set<string> {
  const output = new Set<string>();
  for (const entry of catalog.entries) {
    if (entry.kind !== "component") continue;
    for (const item of entry.entrypoints) output.add(item);
  }
  return output;
}

function componentByName(catalog: KnowledgeCatalog): Map<string, ComponentDoc> {
  const output = new Map<string, ComponentDoc>();
  for (const entry of catalog.entries)
    if (entry.kind === "component") output.set(entry.name, entry);
  return output;
}

export function parseNamedImports(
  source: string,
  catalog: KnowledgeCatalog,
): ImportedComponent[] {
  const byName = componentByName(catalog);
  const output: ImportedComponent[] = [];
  const pattern = /import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"];?/g;
  for (const match of source.matchAll(pattern)) {
    const entrypoint = match[2] ?? "";
    if (!entrypoint.startsWith("@unpopping-candy/")) continue;
    const members = (match[1] ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    for (const member of members) {
      if (member.startsWith("type ")) continue;
      const [exportedRaw, localRaw] = member.split(/\s+as\s+/);
      const exportedName = exportedRaw?.trim() ?? "";
      const localName = localRaw?.trim() || exportedName;
      if (!exportedName || !localName) continue;
      const directDoc = byName.get(exportedName);
      output.push({
        exportedName,
        localName,
        entrypoint,
        ...(directDoc ? { doc: directDoc } : {}),
      });
    }
  }
  return output;
}

export function findInvalidImports(
  catalog: KnowledgeCatalog,
  filePath: string,
  source: string,
): EvaluationFinding[] {
  const allowed = entrypointSet(catalog);
  const findings: EvaluationFinding[] = [];
  const pattern =
    /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"](@unpopping-candy\/[^'"]+)['"]/g;
  for (const match of source.matchAll(pattern)) {
    const specifier = match[1] ?? "";
    const invalidPrivatePath = /\/(?:src|dist)(?:\/|$)/.test(specifier);
    const validAsset = /\/(?:styles\.css|tokens\.json)$/.test(specifier);
    if (!invalidPrivatePath && (allowed.has(specifier) || validAsset)) continue;
    findings.push({
      code: invalidPrivatePath ? "private-import" : "unknown-entrypoint",
      severity: "error",
      path: filePath,
      message: invalidPrivatePath
        ? `Import ${specifier} bypasses a public package entrypoint.`
        : `Import ${specifier} is not present in the installed Unpopping Candy catalog.`,
      evidence: `line ${lineOf(source, match.index ?? 0)}`,
    });
  }
  return findings;
}
