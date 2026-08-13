import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { executeCliCommand } from "../src/commands.ts";
import { PopcandyProjectError } from "../src/project-errors.ts";
import { services } from "./cli-fixture.ts";

test("commands reject unknown flags and unexpected positional paths", async () => {
  const cases = [
    [
      "scaffold",
      ["template.profile-settings", "--target-directory", "src/ui"],
      /unknown option --target-directory/i,
    ],
    ["validate", ["."], /validate does not accept positional arguments/i],
    [
      "scaffold",
      ["template.profile-settings", "--target"],
      /requires a value/i,
    ],
  ] as const;
  for (const [command, args, message] of cases) {
    const result = await executeCliCommand(services, command, args, "/unused");
    assert.equal(result.ok, false);
    if (result.ok) throw new Error("Expected a command argument failure.");
    assert.equal(result.error.code, "INVALID_INPUT");
    assert.match(result.error.message, message);
  }
});

test("all catalog-aware commands preserve a typed mixed-version failure after one context resolution", async () => {
  // Given a context resolver that observes a known mixed package set
  const calls: string[] = [];
  const mixedError = new PopcandyProjectError(
    "POPCANDY_VERSION_SET_MIXED",
    "Mixed package releases.",
  );
  const mixedServices = {
    ...services,
    async projectContext(path: string) {
      calls.push(path);
      throw mixedError;
    },
    async catalogContext(path: string) {
      calls.push(path);
      throw mixedError;
    },
  };
  const commands = [
    ["info", []],
    ["search", ["button"]],
    ["get", ["ui.button"]],
    ["compose", ["profile settings"]],
    ["validate", []],
  ] as const;

  // When each command targets the same project
  const results = await Promise.all(
    commands.map(([command, args]) =>
      executeCliCommand(mixedServices, command, args, "/target"),
    ),
  );

  // Then each resolves once and preserves the stable error code
  assert.deepEqual(calls, [
    "/target",
    "/target",
    "/target",
    "/target",
    "/target",
  ]);
  assert.ok(
    results.every(
      (result) =>
        !result.ok && result.error.code === "POPCANDY_VERSION_SET_MIXED",
    ),
  );
});

test("empty consumers report a nullable catalog for info and fail catalog commands actionably", async () => {
  // Given an ordinary project with no Unpopping Candy dependencies or catalog config
  const root = await mkdtemp(join(tmpdir(), "popcandy-empty-"));
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ name: "empty-consumer" }),
  );

  // When info and catalog-requiring commands run
  const info = await executeCliCommand(
    services,
    "info",
    ["--path", root],
    root,
  );
  const failures = await Promise.all([
    executeCliCommand(services, "search", ["button", "--path", root], root),
    executeCliCommand(services, "get", ["ui.button", "--path", root], root),
    executeCliCommand(
      services,
      "compose",
      ["profile settings", "--path", root],
      root,
    ),
    executeCliCommand(services, "validate", ["--path", root], root),
  ]);

  // Then info succeeds diagnostically while catalog commands fail with the typed dependency code
  assert.equal(info.ok, true);
  assert.match(JSON.stringify(info), /"installed":\{\}/);
  assert.match(JSON.stringify(info), /"catalogVersion":null/);
  assert.match(JSON.stringify(info), /POPCANDY_DEPENDENCIES_NOT_INSTALLED/);
  assert.ok(
    failures.every(
      (result) =>
        !result.ok &&
        result.error.code === "POPCANDY_DEPENDENCIES_NOT_INSTALLED",
    ),
  );
});

test("--path selects one repository catalog context and never enters search text", async () => {
  // Given the repository's explicit catalog configuration
  const repositoryRoot = resolve(new URL("../../..", import.meta.url).pathname);

  // When search targets it through the value flag
  const result = await executeCliCommand(
    services,
    "search",
    ["profile", "settings", "--path", repositoryRoot],
    "/unrelated",
  );

  // Then the response is bound to repository config and the query excludes the path
  assert.equal(result.ok, true);
  assert.match(JSON.stringify(result), /"query":"profile settings"/);
  assert.match(JSON.stringify(result), /"catalogSource":"repository-config"/);
});

test("explicit catalog configuration fails closed when missing, malformed, or escaping root", async () => {
  // Given explicit configurations that cannot safely produce a valid catalog
  const cases = [
    { schemaVersion: 1, catalog: "./missing.json" },
    { schemaVersion: 1, catalog: "../outside.json" },
    { schemaVersion: 1, catalog: 42 },
    { schemaVersion: 2, catalog: "./catalog.json" },
    { schemaVersion: 1, catalog: "/tmp/catalog.json" },
  ] as const;

  // When each project context is resolved
  const results = await Promise.all(
    cases.map(async (config) => {
      const root = await mkdtemp(join(tmpdir(), "popcandy-config-invalid-"));
      await writeFile(
        join(root, "package.json"),
        JSON.stringify({ name: "fixture" }),
      );
      await writeFile(
        join(root, "popcandy.config.json"),
        JSON.stringify(config),
      );
      return executeCliCommand(
        services,
        "search",
        ["button", "--path", root],
        root,
      );
    }),
  );

  // Then no explicit config silently falls back to bundled catalog state
  assert.ok(
    results.every(
      (result) =>
        !result.ok && result.error.code === "POPCANDY_CATALOG_INCOMPATIBLE",
    ),
  );
});
