import { bundledCatalog } from "../src/index.ts";
import { openingTags } from "./public-example-parser.ts";

type ComponentEntry = Extract<
  (typeof bundledCatalog.entries)[number],
  { kind: "component" }
>;

type ParsedAttribute = {
  name: string;
  literal?: string;
  kind?: "string" | "number";
};

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
const externalExampleComponents = new Set([
  "App",
  "BookmarkIcon",
  "FollowButton",
]);

function allowedLiterals(
  component: ComponentEntry,
  name: string,
  type: string,
) {
  const literals = [...type.matchAll(/(?:^|\|)\s*'([^']+)'\s*(?=\||$)/g)].map(
    (match) => match[1],
  );
  if (name === "variant" && component.variants.length > 0)
    return component.variants.map((variant) => variant.name);
  return literals;
}

function literalError(
  component: ComponentEntry,
  type: string,
  attribute: ParsedAttribute,
) {
  if (attribute.kind === "string") {
    const literals = allowedLiterals(component, attribute.name, type);
    if (literals.length && !literals.includes(attribute.literal ?? ""))
      return `expected ${literals.join(" | ")}`;
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
        let expressionQuote = "";
        let escaped = false;
        const start = ++index;
        while (index < source.length && braces) {
          const character = source[index] ?? "";
          if (expressionQuote) {
            if (escaped) escaped = false;
            else if (character === "\\") escaped = true;
            else if (character === expressionQuote) expressionQuote = "";
          } else if (['"', "'", "`"].includes(character))
            expressionQuote = character;
          else if (character === "{") braces += 1;
          else if (character === "}") braces -= 1;
          index += 1;
        }
        const value = source.slice(start, index - 1).trim();
        if (/^\d+$/.test(value)) {
          attribute.kind = "number";
          attribute.literal = value;
        }
        if (/^(['"]).*\1$/.test(value)) {
          attribute.kind = "string";
          attribute.literal = value.slice(1, -1);
        }
      }
    }
    result.push(attribute);
  }
  return result;
}

export function publicContractErrors(
  code: string,
  label: string,
  expectedComponent?: string,
) {
  const errors: string[] = [];
  const tags = openingTags(code);
  if (
    expectedComponent &&
    code.includes("<") &&
    !tags.some((tag) => tag.name === expectedComponent)
  ) {
    errors.push(`${label}: expected direct ${expectedComponent} JSX`);
    return errors;
  }
  for (const tag of tags) {
    const component = components.get(tag.name);
    if (!component) {
      if (expectedComponent && !externalExampleComponents.has(tag.name))
        errors.push(`${label}: unknown JSX component ${tag.name}`);
      continue;
    }
    const present = new Set<string>();
    if (/\{\.\.\./.test(tag.attributes))
      errors.push(`${label}: ${component.name} uses unverified prop spread`);
    if (tag.hasChildren) present.add("children");
    for (const attribute of attributes(tag.attributes)) {
      const name = attribute.name;
      present.add(name);
      const prop = component.props.find((candidate) => candidate.name === name);
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
      const mismatch = prop && literalError(component, prop.type, attribute);
      if (mismatch)
        errors.push(`${label}: ${component.name}.${name} ${mismatch}`);
    }
    for (const prop of component.props.filter(
      (candidate) => candidate.required,
    )) {
      if (!present.has(prop.name))
        errors.push(`${label}: ${component.name} is missing ${prop.name}`);
    }
  }
  return errors;
}
