import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import {
  bundledCatalog,
  getCatalogEntry,
  searchCatalog,
  validateCatalog,
} from "../src/index.ts";

type ComponentEntry = Extract<
  (typeof bundledCatalog.entries)[number],
  { kind: "component" }
>;

const components = new Map<string, ComponentEntry>(
  bundledCatalog.entries
    .filter((entry) => entry.kind === "component")
    .map((entry) => [entry.name, entry]),
);
const nativeProps = new Set([
  "children",
  "className",
  "disabled",
  "id",
  "onClick",
  "role",
  "style",
  "tabIndex",
  "type",
]);

type ParsedAttribute = {
  name: string;
  literal?: string;
  kind?: "string" | "number";
};

function literalError(type: string, attribute: ParsedAttribute) {
  if (attribute.kind === "string") {
    const literals = [...type.matchAll(/(?:^|\|)\s*'([^']+)'\s*(?=\||$)/g)].map(
      (match) => match[1],
    );
    if (literals.length && !literals.includes(attribute.literal ?? ""))
      return `expected ${type}`;
    const numbers = [...type.matchAll(/(?:^|\|)\s*(\d+)\s*(?=\||$)/g)];
    if (!literals.length && numbers.length) return `expected ${type}`;
  }
  if (attribute.kind === "number") {
    const literals = [...type.matchAll(/(?:^|\|)\s*(\d+)\s*(?=\||$)/g)].map(
      (match) => match[1],
    );
    if (literals.length && !literals.includes(attribute.literal ?? ""))
      return `expected ${type}`;
    if (!literals.length && !/(?:^|\W)number(?:\W|$)/.test(type))
      return `expected ${type}`;
  }
  return undefined;
}

function openingTags(code: string) {
  const tags: Array<{
    name: string;
    attributes: string;
    hasChildren: boolean;
  }> = [];
  for (const match of code.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
    const name = match[1];
    if (!name) continue;
    let braces = 0;
    let quote = "";
    let end = match.index + match[0].length;
    for (; end < code.length; end += 1) {
      const character = code[end];
      if (quote) {
        if (character === quote && code[end - 1] !== "\\") quote = "";
      } else if (character === '"' || character === "'") quote = character;
      else if (character === "{") braces += 1;
      else if (character === "}") braces -= 1;
      else if (character === ">" && braces === 0) break;
    }
    const attributes = code.slice(match.index + match[0].length, end);
    tags.push({
      name,
      attributes,
      hasChildren: !attributes.trimEnd().endsWith("/"),
    });
  }
  return tags;
}

function attributes(source: string) {
  const result: ParsedAttribute[] = [];
  for (let index = 0; index < source.length; ) {
    while (/\s|\//.test(source[index] ?? "")) index += 1;
    const match = /^[A-Za-z][\w:-]*/.exec(source.slice(index));
    if (!match) break;
    const attribute: ParsedAttribute = { name: match[0] };
    index += match[0].length;
    while (/\s/.test(source[index] ?? "")) index += 1;
    if (source[index] === "=") {
      index += 1;
      while (/\s/.test(source[index] ?? "")) index += 1;
      const quote = source[index];
      if (quote === '"' || quote === "'") {
        const end = source.indexOf(quote, index + 1);
        attribute.kind = "string";
        attribute.literal = source.slice(index + 1, end);
        index = end + 1;
      } else if (quote === "{") {
        let braces = 1;
        const start = ++index;
        while (index < source.length && braces) {
          if (source[index] === "{") braces += 1;
          if (source[index] === "}") braces -= 1;
          index += 1;
        }
        const value = source.slice(start, index - 1).trim();
        if (/^\d+$/.test(value))
          ({ kind: attribute.kind, literal: attribute.literal } = {
            kind: "number",
            literal: value,
          });
        if (/^(['"]).*\1$/.test(value))
          ({ kind: attribute.kind, literal: attribute.literal } = {
            kind: "string",
            literal: value.slice(1, -1),
          });
      }
    }
    result.push(attribute);
  }
  return result;
}

function publicContractErrors(code: string, label: string) {
  const errors: string[] = [];
  for (const tag of openingTags(code)) {
    const component = components.get(tag.name);
    if (component) {
      const present = new Set<string>();
      const spread = /\{\.\.\./.test(tag.attributes);
      if (tag.hasChildren) present.add("children");
      for (const attribute of attributes(tag.attributes)) {
        const name = attribute.name;
        present.add(name);
        const prop = component.props.find(
          (candidate) => candidate.name === name,
        );
        const passThrough =
          "nativeElement" in component &&
          component.nativeElement &&
          (nativeProps.has(name) ||
            /^(?:aria-|data-|on[A-Z])/.test(name) ||
            ["autoComplete", "key", "maxLength", "required", "value"].includes(
              name,
            ));
        if (!prop && !passThrough)
          errors.push(`${label}: ${component.name} has unknown prop ${name}`);
        const mismatch = prop && literalError(prop.type, attribute);
        if (mismatch)
          errors.push(`${label}: ${component.name}.${name} ${mismatch}`);
      }
      for (const prop of component.props.filter(
        (candidate) => candidate.required,
      )) {
        if (!spread && !present.has(prop.name))
          errors.push(`${label}: ${component.name} is missing ${prop.name}`);
      }
    }
  }
  return errors;
}

test("bundled catalog contains every stable public surface", () => {
  assert.equal(
    bundledCatalog.entries.filter((entry) => entry.kind === "component").length,
    32,
  );
  assert.equal(
    bundledCatalog.entries.filter((entry) => entry.kind === "pattern").length,
    6,
  );
  assert.equal(
    bundledCatalog.entries.filter((entry) => entry.kind === "template").length,
    5,
  );
  assert.equal(
    bundledCatalog.entries.filter((entry) => entry.kind === "migration").length,
    1,
  );
  assert.deepEqual(validateCatalog(bundledCatalog), []);
});

test("bundled catalog exposes version-aware component guidance", () => {
  const button = getCatalogEntry(bundledCatalog, "Button");
  assert.equal(button?.id, "ui.button");
  assert.equal(button?.version, "0.1.0");
  assert.equal(button?.kind, "component");
  if (button?.kind !== "component")
    throw new Error("Button metadata must be a component.");
  assert.ok(button.entrypoints.includes("@unpopping-candy/ui/button"));
  assert.ok(button.accessibility.requirements.length >= 2);
  assert.ok(button.stories.includes("catalog-ui-button--contract"));
});

test("search returns product patterns as well as components", () => {
  const results = searchCatalog(bundledCatalog, "social feed");
  assert.ok(results.some((result) => result.id === "pattern.social-feed"));
  assert.ok(results.some((result) => result.id === "social.timeline-view"));
});

test("bundled component contracts include compiler-extracted public props", () => {
  const button = bundledCatalog.entries.find(
    (entry) => entry.id === "ui.button",
  );
  assert.ok(button && button.kind === "component");
  if (button.kind !== "component") return;
  assert.equal(button.nativeElement, "button");
  assert.ok(
    button.props.some(
      (prop) => prop.name === "pending" && prop.required === false,
    ),
  );
  assert.ok(button.props.some((prop) => prop.name === "leadingIcon"));
});

test("all preferred examples and Registry TSX templates honor public component props", async () => {
  const examples = bundledCatalog.entries.flatMap((entry) =>
    entry.kind === "component"
      ? entry.examples.preferred.map(
          (example, index) =>
            [
              example.code,
              `${entry.id} preferred example ${index + 1}`,
            ] as const,
        )
      : [],
  );
  const templates = bundledCatalog.entries.flatMap((entry) =>
    entry.kind === "template"
      ? entry.files
          .filter((file) => file.source.endsWith(".tsx"))
          .map((file) => [file.source, `${entry.id} ${file.path}`] as const)
      : [],
  );
  const errors = examples.flatMap(([code, label]) =>
    publicContractErrors(code, label),
  );
  for (const [path, label] of templates) {
    errors.push(
      ...publicContractErrors(await readFile(resolve(path), "utf8"), label),
    );
  }
  assert.deepEqual(errors, []);
});
