import {
  createScanner,
  LanguageVariant,
  SyntaxKind,
} from "typescript/unstable/ast";

type OpeningTag = {
  name: string;
  attributes: string;
  hasChildren: boolean;
};

function tagEnd(code: string, start: number) {
  const scanner = createScanner(false, LanguageVariant.JSX, code, start);
  let braces = 0;
  for (
    let token = scanner.scan();
    token !== SyntaxKind.EndOfFile;
    token = scanner.scan()
  ) {
    if (token === SyntaxKind.OpenBraceToken) braces += 1;
    else if (token === SyntaxKind.CloseBraceToken) braces -= 1;
    else if (token === SyntaxKind.GreaterThanToken && braces === 0)
      return scanner.getTokenStart();
  }
  return code.length;
}

function maskNonCode(source: string) {
  const output = [...source];
  let state = "code";
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index] ?? "";
    const next = source[index + 1];
    if (state !== "code") {
      output[index] = character === "\n" ? "\n" : " ";
      if (state === "line-comment" && character === "\n") state = "code";
      else if (state === "block-comment" && character === "*" && next === "/") {
        output[index + 1] = " ";
        index += 1;
        state = "code";
      } else if (!state.endsWith("comment")) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (
          (state === "single" && character === "'") ||
          (state === "double" && character === '"') ||
          (state === "template" && character === "`")
        )
          state = "code";
      }
      continue;
    }
    if (character === "/" && ["/", "*"].includes(next ?? "")) {
      output[index] = output[index + 1] = " ";
      index += 1;
      state = next === "/" ? "line-comment" : "block-comment";
    } else if (["'", '"', "`"].includes(character)) {
      output[index] = " ";
      state =
        character === "'"
          ? "single"
          : character === '"'
            ? "double"
            : "template";
    }
  }
  return output.join("");
}

export function openingTags(code: string) {
  const tags: OpeningTag[] = [];
  const masked = maskNonCode(code);
  let cursor = 0;
  while (cursor < masked.length) {
    const match = /^<([A-Z][A-Za-z0-9]*(?:\.[A-Za-z_$][\w$]*)*)\b/.exec(
      masked.slice(cursor),
    );
    if (!match?.[1]) {
      cursor += 1;
      continue;
    }
    const end = tagEnd(code, cursor + match[0].length);
    const attributes = code.slice(cursor + match[0].length, end);
    tags.push({
      name: match[1],
      attributes,
      hasChildren: !attributes.trimEnd().endsWith("/"),
    });
    cursor = end + 1;
  }
  return tags;
}
