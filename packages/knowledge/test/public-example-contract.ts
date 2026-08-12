import { bundledCatalog } from "../src/index.ts";
import { openingTags, type ParsedAttribute } from "./public-example-parser.ts";

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
      if (
        expectedComponent &&
        /^[A-Z]/.test(tag.name) &&
        !externalExampleComponents.has(tag.name)
      )
        errors.push(`${label}: unknown JSX component ${tag.name}`);
      continue;
    }
    const present = new Set<string>();
    if (tag.hasSpread)
      errors.push(`${label}: ${component.name} uses unverified prop spread`);
    if (tag.hasChildren) present.add("children");
    for (const attribute of tag.attributes) {
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
