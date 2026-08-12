import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const fixtureIds = [
  "base",
  "publish-post",
  "member-moderation",
  "activity-review",
];

export const publicPackageFolders = [
  "cli",
  "icons",
  "knowledge",
  "mcp",
  "registry",
  "social",
  "theme",
  "tokens",
  "ui",
];

export async function readCompatibilityMatrix(workspaceRoot) {
  const source = await readFile(
    join(workspaceRoot, "fixtures/compatibility/matrix.json"),
    "utf8",
  );
  const value = JSON.parse(source);
  if (!value || typeof value !== "object" || !value.cells || !value.managers) {
    throw new TypeError("Compatibility matrix must define cells and managers.");
  }
  return value;
}

export function parseCompatibilityArguments(argv) {
  const options = { all: false, plan: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    if (argument === "--all" || argument === "--plan") {
      options[argument.slice(2)] = true;
      continue;
    }
    if (
      argument !== "--fixture" &&
      argument !== "--cell" &&
      argument !== "--manager"
    ) {
      throw new TypeError(`Unknown compatibility argument: ${argument}`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new TypeError(`${argument} requires a value.`);
    }
    options[argument.slice(2)] = value;
    index += 1;
  }
  return options;
}

export function createCompatibilityPlan(matrix, options) {
  const fixtures = options.fixture ? [options.fixture] : fixtureIds;
  const cells = options.all ? Object.keys(matrix.cells) : [options.cell];
  const managers = options.all
    ? Object.keys(matrix.managers)
    : [options.manager];
  if (!options.all && (!options.fixture || !options.cell || !options.manager)) {
    throw new TypeError(
      "Focused execution requires --fixture, --cell, and --manager.",
    );
  }
  for (const fixture of fixtures) {
    if (!fixtureIds.includes(fixture)) {
      throw new TypeError(`Unknown fixture: ${fixture}`);
    }
  }
  for (const cell of cells) {
    if (!cell || !matrix.cells[cell]) {
      throw new TypeError(`Unknown cell: ${cell}`);
    }
  }
  for (const manager of managers) {
    if (!manager || !matrix.managers[manager]) {
      throw new TypeError(`Unknown manager: ${manager}`);
    }
  }
  return fixtures.flatMap((fixture) =>
    cells.flatMap((cell) =>
      managers.map((manager) => ({
        id: `${fixture}/${cell}/${manager}`,
        fixture,
        cell,
        manager,
      })),
    ),
  );
}
