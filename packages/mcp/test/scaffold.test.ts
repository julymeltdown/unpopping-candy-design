import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { bundledCatalog, domain } from "./domain-fixture.ts";

test("scaffold tool is dry-run by default and writes only after explicit apply", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-mcp-scaffold-"));
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ name: "fixture" }),
  );
  await writeFile(join(root, "catalog.json"), JSON.stringify(bundledCatalog));
  await writeFile(
    join(root, "popcandy.config.json"),
    JSON.stringify({ schemaVersion: 1, catalog: "./catalog.json" }),
  );
  const dryRun = (await domain.scaffold({
    templateId: "template.profile-settings",
    path: root,
    targetDirectory: "profile",
    variables: { componentPrefix: "Agent" },
  })) as { mode: string; applied: boolean };
  assert.equal(dryRun.mode, "dry-run");
  assert.equal(dryRun.applied, false);
  const applied = (await domain.scaffold({
    templateId: "template.profile-settings",
    path: root,
    targetDirectory: "profile",
    variables: { componentPrefix: "Agent" },
    apply: true,
  })) as { applied: boolean };
  assert.equal(applied.applied, true);
  assert.match(
    await readFile(join(root, "profile/src/profile-settings.tsx"), "utf8"),
    /AgentProfileSettings/,
  );
});

test("scaffold uses the selected catalog source without bundled substitution", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-mcp-selected-scaffold-"));
  const template = bundledCatalog.entries.find(
    (entry) => entry.id === "template.profile-settings",
  );
  if (!template || template.kind !== "template")
    throw new Error("Expected profile template fixture.");
  const catalog = {
    ...bundledCatalog,
    packageVersion: "selected-template",
    entries: [
      {
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
    ],
  };
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({ name: "fixture" }),
  );
  await writeFile(join(root, "catalog.json"), JSON.stringify(catalog));
  await writeFile(
    join(root, "popcandy.config.json"),
    JSON.stringify({ schemaVersion: 1, catalog: "./catalog.json" }),
  );

  await assert.rejects(
    domain.scaffold({ templateId: "template.profile-settings", path: root }),
    /missing-selected/,
  );
});
