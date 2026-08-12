import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import {
  resolveCatalogContext,
  resolveProjectCatalogContext,
  validatePopcandyProject,
} from "../../cli/src/index.ts";
import {
  bundledCatalog,
  generateDesignMarkdown,
} from "../../knowledge/src/index.ts";
import tokens from "../../tokens/src/tokens.json" with { type: "json" };
import { createRegistryService } from "../../registry/src/index.ts";
import { createPopcandyMcpDomain } from "../src/domain.ts";

const registry = createRegistryService({
  catalog: bundledCatalog,
  templateRoot: join(
    resolve(new URL("../../..", import.meta.url).pathname),
    "packages/registry/templates",
  ),
});
const templateRoot = join(
  resolve(new URL("../../..", import.meta.url).pathname),
  "packages/registry/templates",
);
const domain = createPopcandyMcpDomain({
  catalog: bundledCatalog,
  tokens,
  projectContext: resolveProjectCatalogContext,
  catalogContext: resolveCatalogContext,
  designMarkdown: (catalog) => generateDesignMarkdown(catalog, tokens),
  validate: validatePopcandyProject,
  registryManifest: (catalog) =>
    createRegistryService({ catalog, templateRoot }).manifest(),
  scaffold: (catalog, input) =>
    createRegistryService({ catalog, templateRoot }).scaffold(input),
});

test("resource list exposes static context and every versioned catalog entry", () => {
  const resources = domain.listResources();
  assert.equal(resources.length, 49);
  assert.ok(
    resources.some((resource) => resource.uri === "popcandy://design/current"),
  );
  assert.ok(
    resources.some((resource) => resource.uri === "popcandy://registry"),
  );
  assert.ok(
    resources.some(
      (resource) => resource.uri === "popcandy://components/ui.button",
    ),
  );
  assert.equal(
    new Set(resources.map((resource) => resource.uri)).size,
    resources.length,
  );
});

test("dynamic component resources return exact structured metadata", async () => {
  const resource = await domain.readResource("popcandy://components/ui.button");
  assert.equal(resource.mimeType, "application/json");
  const content = JSON.parse(resource.text);
  assert.equal(content.entry.id, "ui.button");
  assert.equal(content.entry.version, "0.1.0");
  assert.ok(content.entry.accessibility.requirements.length >= 2);
});

test("search and composition tools remain bounded and version-aware", async () => {
  const searchResult = await domain.search({
    query: "social feed",
    limit: 500,
  });
  assert.equal(
    (searchResult as { catalogVersion: string }).catalogVersion,
    bundledCatalog.packageVersion,
  );
  const plan = await domain.compose({ request: "social feed page" });
  assert.match(JSON.stringify(plan), /"phase":"verify"/);
});

test("project and validation tools read the selected local root without mutation", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-mcp-"));
  await mkdir(join(root, "src"));
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({
      name: "fixture",
      dependencies: {
        react: "19.2.0",
        vite: "8.1.0",
        "@unpopping-candy/icons": "0.1.0",
        "@unpopping-candy/tokens": "0.1.0",
        "@unpopping-candy/ui": "0.1.0",
      },
    }),
  );
  await writeFile(
    join(root, "package-lock.json"),
    JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "node_modules/@unpopping-candy/icons": { version: "0.1.0" },
        "node_modules/@unpopping-candy/tokens": { version: "0.1.0" },
        "node_modules/@unpopping-candy/ui": { version: "0.1.0" },
      },
    }),
  );
  await writeFile(
    join(root, "src/app.tsx"),
    "import { Button } from '@unpopping-candy/ui/src/button/button';\nexport const App=()=> <Button>Save</Button>;\n",
  );
  await writeFile(join(root, "catalog.json"), JSON.stringify(bundledCatalog));
  await writeFile(
    join(root, "popcandy.config.json"),
    JSON.stringify({ schemaVersion: 1, catalog: "./catalog.json" }),
  );
  const info = (await domain.projectInfo({ path: root })) as {
    project: { root: string };
  };
  assert.equal(info.project.root, root);
  const validation = (await domain.validate({ path: root })) as {
    summary: { errors: number };
  };
  assert.equal(validation.summary.errors, 1);
});

test("catalog tools reuse the selected project context and expose its exact version", async () => {
  // Given a compatible installed consumer selected by path
  const root = await mkdtemp(join(tmpdir(), "popcandy-mcp-context-"));
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({
      name: "fixture",
      dependencies: {
        "@unpopping-candy/icons": "0.1.0",
        "@unpopping-candy/ui": "0.1.0",
        "@unpopping-candy/tokens": "0.1.0",
        "@unpopping-candy/theme": "0.1.0",
      },
    }),
  );
  await writeFile(
    join(root, "package-lock.json"),
    JSON.stringify({
      lockfileVersion: 3,
      packages: {
        "node_modules/@unpopping-candy/ui": { version: "0.1.0" },
        "node_modules/@unpopping-candy/icons": { version: "0.1.0" },
        "node_modules/@unpopping-candy/tokens": { version: "0.1.0" },
        "node_modules/@unpopping-candy/theme": { version: "0.1.0" },
      },
    }),
  );
  await writeFile(join(root, "catalog.json"), JSON.stringify(bundledCatalog));
  await writeFile(
    join(root, "popcandy.config.json"),
    JSON.stringify({ schemaVersion: 1, catalog: "./catalog.json" }),
  );

  // When each catalog-backed method targets that consumer
  const searchResult = await domain.search({ query: "button", path: root });
  const getResult = await domain.get({ id: "ui.button", path: root });
  const composeResult = await domain.compose({
    request: "profile settings",
    path: root,
  });
  const resource = await domain.readResource("popcandy://catalog", root);

  // Then every response reports the selected catalog rather than ambient bundled state
  for (const result of [searchResult, getResult, composeResult]) {
    assert.equal(
      (result as { catalogVersion: string }).catalogVersion,
      bundledCatalog.packageVersion,
    );
  }
  assert.equal(
    JSON.parse(resource.text).catalogVersion,
    bundledCatalog.packageVersion,
  );
});

test("prompts encode the mandatory detect-search-compose-validate workflow", () => {
  assert.equal(domain.listPrompts().length, 4);
  const prompt = domain.getPrompt("build-interface", {
    task: "profile settings",
    path: "/workspace/app",
  });
  assert.match(prompt.text, /popcandy:\/\/project\/info/);
  assert.match(prompt.text, /popcandy_search/);
  assert.match(prompt.text, /popcandy_compose/);
  assert.match(prompt.text, /popcandy_validate/);
});

test("unknown resources and entries fail instead of returning invented context", async () => {
  await assert.rejects(
    domain.readResource("popcandy://components/ui.missing"),
    /not found/i,
  );
  await assert.rejects(domain.get({ id: "ui.missing" }), /not found/i);
});

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
    await (
      await import("node:fs/promises")
    ).readFile(join(root, "profile/src/profile-settings.tsx"), "utf8"),
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
