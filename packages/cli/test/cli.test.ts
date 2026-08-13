import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { bundledCatalog, searchCatalog } from "../../knowledge/src/index.ts";
import { executeCliCommand } from "../src/commands.ts";
import { composeInterfacePlan } from "../src/compose.ts";
import { detectPopcandyProject } from "../src/project-info.ts";
import { validatePopcandyProject } from "../src/validate.ts";
import { createCliFixture, services } from "./cli-fixture.ts";

test("project detection reports exact Unpopping Candy and framework context", async () => {
  const root = await createCliFixture();
  const info = await detectPopcandyProject(join(root, "src"));
  assert.equal(info.root, root);
  assert.equal(info.framework, "vite-react");
  assert.equal(info.packageManager, "pnpm");
  assert.equal(info.installed["@unpopping-candy/ui"], "0.1.0");
  assert.deepEqual(info.styleImports, [
    "@unpopping-candy/icons/styles.css",
    "@unpopping-candy/tokens/styles.css",
    "@unpopping-candy/ui/styles.css",
  ]);
});

test("validation accepts the public social model entrypoint", async () => {
  const root = await createCliFixture();
  const report = await validatePopcandyProject(bundledCatalog, root);
  assert.equal(report.summary.errors, 0);
});

test("search and get commands use the exact bundled catalog", async () => {
  const searchResult = await executeCliCommand(services, "search", [
    "social",
    "feed",
    "--json",
  ]);
  if (!searchResult.ok) throw new Error(searchResult.error.message);
  assert.equal(searchResult.ok, true);
  assert.ok(
    (searchResult.data as { results: { id: string }[] }).results.some(
      (result) => result.id === "pattern.social-feed",
    ),
  );
  const getResult = await executeCliCommand(services, "get", ["Button"]);
  if (!getResult.ok) throw new Error(getResult.error.message);
  assert.equal(getResult.ok, true);
  assert.equal(
    (getResult.data as { entry: { id: string } }).entry.id,
    "ui.button",
  );
});

test("composition planning returns a bounded implementation and verification sequence", () => {
  const plan = composeInterfacePlan(
    bundledCatalog,
    "social feed page",
    (query, options) => searchCatalog(bundledCatalog, query, options),
  );
  assert.equal(plan.catalogVersion, bundledCatalog.packageVersion);
  assert.ok(plan.patterns.some((entry) => entry.id === "pattern.social-feed"));
  assert.ok(
    plan.components.some((entry) => entry.id === "social.timeline-view"),
  );
  assert.equal(plan.steps.at(-1)?.phase, "verify");
  assert.ok(plan.components.length <= 14);
});

test("validation rejects private imports and reports hardcoded visual values", async () => {
  const root = await createCliFixture();
  await writeFile(
    join(root, "src/bad.tsx"),
    [
      "import { Button } from '@unpopping-candy/ui/src/button/button';",
      "export const Bad = () => <div style={{ color: '#ff00aa' }}><Button>Save</Button></div>;",
    ].join("\n"),
  );
  const report = await validatePopcandyProject(bundledCatalog, root);
  assert.ok(
    report.issues.some(
      (issue) => issue.code === "deep-import" && issue.severity === "error",
    ),
  );
  assert.ok(
    report.issues.some(
      (issue) =>
        issue.code === "hardcoded-color" && issue.severity === "warning",
    ),
  );
});

test("doctor reports missing installation and style prerequisites without mutating the project", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-doctor-"));
  await mkdir(join(root, "src"));
  await writeFile(
    join(root, "package.json"),
    JSON.stringify({
      name: "empty",
      dependencies: { react: "19.2.0", vite: "8.1.0" },
    }),
  );
  const result = await executeCliCommand(services, "doctor", [], root);
  if (!result.ok) throw new Error(result.error.message);
  assert.equal(result.ok, true);
  const recommendations = (result.data as { recommendations: string[] })
    .recommendations;
  assert.ok(
    recommendations.some((item) => item.includes("@unpopping-candy/ui")),
  );
  assert.ok(
    recommendations.some((item) => item.includes("popcandy.config.json")),
  );
});

test("validation honors configured exclusions and additional public entrypoints", async () => {
  const root = await createCliFixture();
  await mkdir(join(root, "test"), { recursive: true });
  await writeFile(
    join(root, "popcandy.config.json"),
    JSON.stringify({
      schemaVersion: 1,
      validation: {
        exclude: ["test/**"],
        allowedEntrypoints: ["@unpopping-candy/knowledge"],
      },
    }),
  );
  await writeFile(
    join(root, "src/tool.ts"),
    "import type { KnowledgeCatalog } from '@unpopping-candy/knowledge';\nexport type Catalog = KnowledgeCatalog;\n",
  );
  await writeFile(
    join(root, "test/intentional-invalid.tsx"),
    "import { Button } from '@unpopping-candy/ui/src/button/button';\nexport const Bad = () => <div style={{ color: '#ff00aa' }}><Button>Save</Button></div>;\n",
  );
  const report = await validatePopcandyProject(bundledCatalog, root);
  assert.equal(report.summary.errors, 0);
  assert.equal(report.summary.warnings, 0);
  assert.ok(report.filesScanned >= 2);
  assert.ok(
    report.issues.every(
      (issue) => issue.file !== "test/intentional-invalid.tsx",
    ),
  );
});
