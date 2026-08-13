const commandFlags: Readonly<
  Record<
    string,
    Readonly<{ values: readonly string[]; booleans?: readonly string[] }>
  >
> = {
  info: { values: ["--path"] },
  list: { values: ["--path", "--kind", "--limit"] },
  get: { values: ["--path"] },
  search: { values: ["--path", "--kind", "--limit"] },
  compose: { values: ["--path"] },
  validate: { values: ["--path"] },
  doctor: { values: ["--path"] },
  scaffold: {
    values: ["--path", "--target", "--var"],
    booleans: ["--apply", "--dry-run"],
  },
};

function positional(args: readonly string[]): string[] {
  const output: string[] = [];
  const valueFlags = new Set([
    "--kind",
    "--limit",
    "--path",
    "--target",
    "--var",
  ]);
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value?.startsWith("--")) {
      if (valueFlags.has(value)) index += 1;
      continue;
    }
    if (value) output.push(value);
  }
  return output;
}

export function validateArguments(
  command: string,
  args: readonly string[],
): void {
  const spec = commandFlags[command];
  if (!spec) return;
  const valueFlags = new Set(spec.values);
  const booleanFlags = new Set(["--json", ...(spec.booleans ?? [])]);
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value?.startsWith("--")) continue;
    if (!valueFlags.has(value) && !booleanFlags.has(value))
      throw new Error(`Unknown option ${value} for ${command}.`);
    if (value !== "--var" && seen.has(value))
      throw new Error(`Duplicate option ${value}.`);
    seen.add(value);
    if (valueFlags.has(value)) {
      const next = args[index + 1];
      if (!next || next.startsWith("--"))
        throw new Error(`Option ${value} requires a value.`);
      index += 1;
    }
  }
  const operands = positional(args);
  if (
    ["info", "list", "validate", "doctor"].includes(command) &&
    operands.length
  )
    throw new Error(`${command} does not accept positional arguments.`);
  if (command === "scaffold" && operands.length > 1)
    throw new Error("scaffold accepts exactly one template id.");
}
