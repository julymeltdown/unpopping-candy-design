type OpeningTag = {
  name: string;
  attributes: string;
  hasChildren: boolean;
};

function maskNonCode(source: string) {
  const output = [...source];
  let state = "code";
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index] ?? "";
    const next = source[index + 1];
    if (state !== "code") {
      output[index] = character === "\n" ? "\n" : " ";
      if (state === "line" && character === "\n") state = "code";
      else if (state === "block" && character === "*" && next === "/") {
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
    let braces = 0;
    let quote = "";
    let end = cursor + match[0].length;
    for (; end < code.length; end += 1) {
      const character = code[end];
      if (quote) {
        if (character === quote && code[end - 1] !== "\\") quote = "";
      } else if (character === '"' || character === "'") quote = character;
      else if (character === "{") braces += 1;
      else if (character === "}") braces -= 1;
      else if (character === ">" && braces === 0) break;
    }
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
