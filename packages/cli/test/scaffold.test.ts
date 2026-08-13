import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { bundledCatalog } from "../../knowledge/src/index.ts";
import { executeCliCommand } from "../src/commands.ts";
import { services } from "./cli-fixture.ts";

test("scaffold is bound to the selected catalog entry and source", async () => {
  const button = bundledCatalog.entries.find(
    (entry) => entry.id === "ui.button",
  );
  const template = bundledCatalog.entries.find(
    (entry) => entry.id === "template.profile-settings",
  );
  if (
    !button ||
    button.kind !== "component" ||
    !template ||
    template.kind !== "template"
  )
    throw new Error("Missing scaffold fixtures.");
  const entries = [
    {
      entry: { ...button, id: template.id, related: [] },
      code: "POPCANDY_CATALOG_INCOMPATIBLE",
      message: /unavailable/,
    },
    {
      entry: {
        ...template,
        components: [],
        patterns: [],
        variables: [],
        files: [
          {
            path: "selected.tsx",
            role: "component",
            source: "packages/registry/templates/missing-selected.tsx",
          },
        ],
      },
      code: "ENOENT",
      message: /missing-selected/,
    },
  ];
  for (const selected of entries) {
    const root = await mkdtemp(join(tmpdir(), "popcandy-scaffold-selected-"));
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({ name: "fixture" }),
    );
    await writeFile(
      join(root, "catalog.json"),
      JSON.stringify({
        ...bundledCatalog,
        packageVersion: "selected",
        entries: [selected.entry],
      }),
    );
    await writeFile(
      join(root, "popcandy.config.json"),
      JSON.stringify({ schemaVersion: 1, catalog: "./catalog.json" }),
    );
    const result = await executeCliCommand(
      services,
      "scaffold",
      [template.id, "--path", root],
      root,
    );
    assert.equal(result.ok, false);
    if (result.ok) throw new Error("Expected selected-catalog failure.");
    assert.equal(result.error.code, selected.code);
    assert.match(result.error.message, selected.message);
    await assert.rejects(readFile(join(root, "selected.tsx"), "utf8"));
  }
});

test("scaffold defaults to dry-run and requires explicit apply for writes", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-cli-scaffold-"));
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ name: "fixture" }),
  );
  await writeFile(
    join(root, "popcandy.config.json"),
    JSON.stringify({ schemaVersion: 1, catalog: "./catalog.json" }),
  );
  await writeFile(join(root, "catalog.json"), JSON.stringify(bundledCatalog));
  const dryRun = await executeCliCommand(
    services,
    "scaffold",
    ["template.profile-settings", "--target", "features/profile"],
    root,
  );
  if (!dryRun.ok) throw new Error(dryRun.error.message);
  assert.equal(dryRun.ok, true);
  assert.equal(
    (dryRun.data as { mode: string; applied: boolean }).mode,
    "dry-run",
  );
  await assert.rejects(
    readFile(join(root, "features/profile/src/profile-settings.tsx"), "utf8"),
  );

  const applied = await executeCliCommand(
    services,
    "scaffold",
    [
      "template.profile-settings",
      "--target",
      "features/profile",
      "--var",
      "componentPrefix=Account",
      "--apply",
    ],
    root,
  );
  if (!applied.ok) throw new Error(applied.error.message);
  assert.equal(applied.ok, true);
  assert.equal((applied.data as { applied: boolean }).applied, true);
  assert.match(
    await readFile(
      join(root, "features/profile/src/profile-settings.tsx"),
      "utf8",
    ),
    /AccountProfileSettings/,
  );
});
