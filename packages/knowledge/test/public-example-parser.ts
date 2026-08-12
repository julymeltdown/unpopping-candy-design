import { parse } from "@babel/parser";
import type {
  File,
  JSXAttribute,
  JSXElement,
  JSXIdentifier,
  JSXMemberExpression,
  JSXNamespacedName,
  JSXOpeningElement,
  Node,
} from "@babel/types";

export type ParsedAttribute = {
  name: string;
  literal?: string;
  kind?: "string" | "number";
};

export type OpeningTag = {
  name: string;
  attributes: readonly ParsedAttribute[];
  hasChildren: boolean;
  hasSpread: boolean;
};

function jsxName(
  name: JSXIdentifier | JSXMemberExpression | JSXNamespacedName,
): string {
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXMemberExpression")
    return `${jsxName(name.object)}.${name.property.name}`;
  return `${name.namespace.name}:${name.name.name}`;
}

function attribute(attribute: JSXAttribute): ParsedAttribute {
  const name = jsxName(attribute.name);
  if (attribute.value?.type === "StringLiteral")
    return { name, kind: "string", literal: attribute.value.value };
  if (attribute.value?.type === "JSXExpressionContainer") {
    const expression = attribute.value.expression;
    if (expression.type === "StringLiteral")
      return { name, kind: "string", literal: expression.value };
    if (expression.type === "NumericLiteral")
      return { name, kind: "number", literal: String(expression.value) };
  }
  return { name };
}

function openingTag(
  opening: JSXOpeningElement,
  hasChildren: boolean,
): OpeningTag {
  return {
    name: jsxName(opening.name),
    attributes: opening.attributes
      .filter((item) => item.type === "JSXAttribute")
      .map(attribute),
    hasChildren,
    hasSpread: opening.attributes.some(
      (item) => item.type === "JSXSpreadAttribute",
    ),
  };
}

function collect(node: Node, tags: OpeningTag[]): void {
  if (node.type === "JSXElement") {
    const element: JSXElement = node;
    tags.push(
      openingTag(element.openingElement, !element.openingElement.selfClosing),
    );
  }
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) {
      for (const item of value)
        if (item && typeof item === "object" && "type" in item)
          collect(item, tags);
    } else if (value && typeof value === "object" && "type" in value) {
      collect(value, tags);
    }
  }
}

export function openingTags(code: string): OpeningTag[] {
  let file: File;
  try {
    file = parse(code, {
      allowAwaitOutsideFunction: true,
      allowReturnOutsideFunction: true,
      allowUndeclaredExports: true,
      plugins: ["jsx", "typescript"],
      sourceType: "module",
    });
  } catch {
    return [];
  }
  const tags: OpeningTag[] = [];
  collect(file.program, tags);
  return tags;
}
