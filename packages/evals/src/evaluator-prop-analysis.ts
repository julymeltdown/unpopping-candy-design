import type { KnowledgeCatalog } from "@unpopping-candy/knowledge";
import type { EvaluationFinding } from "./types.ts";
import { lineOf, parseNamedImports } from "./evaluator-import-analysis.ts";
import type { ImportedComponent } from "./evaluator-import-analysis.ts";

const COMMON_DOM_PROPS = new Set([
  "children",
  "className",
  "style",
  "id",
  "role",
  "title",
  "tabIndex",
  "slot",
  "key",
  "ref",
  "hidden",
  "lang",
  "dir",
  "draggable",
  "contentEditable",
  "suppressHydrationWarning",
  "onClick",
  "onChange",
  "onInput",
  "onSubmit",
  "onFocus",
  "onBlur",
  "onKeyDown",
  "onKeyUp",
  "onPointerDown",
  "onPointerUp",
  "onMouseEnter",
  "onMouseLeave",
  "onOpenChange",
  "onValueChange",
  "type",
  "name",
  "value",
  "defaultValue",
  "placeholder",
  "disabled",
  "required",
  "readOnly",
  "autoFocus",
  "autoComplete",
  "min",
  "max",
  "minLength",
  "maxLength",
  "step",
  "pattern",
  "accept",
  "multiple",
  "checked",
  "defaultChecked",
  "href",
  "target",
  "rel",
  "download",
  "src",
  "alt",
  "width",
  "height",
  "loading",
  "decoding",
  "open",
  "defaultOpen",
  "form",
]);

function attributesFromOpeningTag(tagSource: string): string[] {
  const attributes: string[] = [];
  let index = tagSource.indexOf(" ");
  if (index < 0) return attributes;

  const skipBalanced = (opening: string, closing: string): void => {
    let depth = 0;
    let quote: string | null = null;
    for (; index < tagSource.length; index += 1) {
      const character = tagSource[index] ?? "";
      if (quote) {
        if (character === "\\") index += 1;
        else if (character === quote) quote = null;
        continue;
      }
      if (character === '"' || character === "'") {
        quote = character;
        continue;
      }
      if (character === opening) depth += 1;
      else if (character === closing) {
        depth -= 1;
        if (depth === 0) {
          index += 1;
          return;
        }
      }
    }
  };

  while (index < tagSource.length) {
    while (/\s/.test(tagSource[index] ?? "")) index += 1;
    const current = tagSource[index] ?? "";
    if (
      !current ||
      current === ">" ||
      (current === "/" && tagSource[index + 1] === ">")
    )
      break;
    if (current === "{") {
      skipBalanced("{", "}");
      continue;
    }

    const start = index;
    while (/[A-Za-z0-9_.:-]/.test(tagSource[index] ?? "")) index += 1;
    const name = tagSource.slice(start, index);
    if (!name) {
      index += 1;
      continue;
    }
    if (!attributes.includes(name)) attributes.push(name);

    while (/\s/.test(tagSource[index] ?? "")) index += 1;
    if (tagSource[index] !== "=") continue;
    index += 1;
    while (/\s/.test(tagSource[index] ?? "")) index += 1;
    const valueStart = tagSource[index] ?? "";
    if (valueStart === '"' || valueStart === "'") {
      const quote = valueStart;
      index += 1;
      while (index < tagSource.length) {
        const character = tagSource[index] ?? "";
        if (character === "\\") index += 2;
        else if (character === quote) {
          index += 1;
          break;
        } else index += 1;
      }
    } else if (valueStart === "{") skipBalanced("{", "}");
    else
      while (index < tagSource.length && !/\s|>/.test(tagSource[index] ?? ""))
        index += 1;
  }
  return attributes;
}

function isAllowedProp(name: string, component: ImportedComponent): boolean {
  if (COMMON_DOM_PROPS.has(name)) return true;
  if (
    name.startsWith("aria-") ||
    name.startsWith("data-") ||
    /^on[A-Z]/.test(name)
  )
    return true;
  const metadataProps = new Set(
    component.doc?.props.map((prop) => prop.name) ?? [],
  );
  return metadataProps.has(name);
}

export function findUnknownProps(
  catalog: KnowledgeCatalog,
  filePath: string,
  source: string,
): EvaluationFinding[] {
  const findings: EvaluationFinding[] = [];
  for (const component of parseNamedImports(source, catalog)) {
    if (!component.doc) continue;
    const escaped = component.localName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const openingPattern = new RegExp(
      `<${escaped}\\b([\\s\\S]*?)(?:\\/>|>)`,
      "g",
    );
    for (const match of source.matchAll(openingPattern)) {
      const tagSource = match[0] ?? "";
      for (const prop of attributesFromOpeningTag(tagSource)) {
        if (isAllowedProp(prop, component)) continue;
        findings.push({
          code: "unknown-prop",
          severity: "error",
          path: filePath,
          message: `${component.exportedName} does not document a ${prop} prop.`,
          evidence: `line ${lineOf(source, match.index ?? 0)}`,
        });
      }
    }
  }
  return findings;
}
