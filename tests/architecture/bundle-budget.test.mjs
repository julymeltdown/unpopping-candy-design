import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  BUNDLE_POLICY,
  assertWithinBudgets,
  measurePackageDirectory,
  resolveBundleReportPath,
  resolveBudgetMode,
  validateBundlePolicy,
  writeBundleReport,
} from "../../scripts/verify-bundle-budgets.mjs";

const expectedBudgets = {
  tokens: [2597, 2900, 2900, 5000, 6500, 8000],
  theme: [1826, 2050, 2050, 2300, 2500, 2800],
  icons: [2005, 2250, 2250, 3500, 4500, 5500],
  ui: [15220, 16750, 16750, 45000, 75000, 110000],
  social: [10336, 11400, 11400, 14000, 20000, 30000],
  knowledge: [26161, 28800, 30000, 52000, 76000, 105000],
  registry: [4556, 5100, 5100, 6500, 7500, 9000],
  cli: [8330, 9200, 15000, 15000, 15000, 16000],
  mcp: [4808, 5300, 5300, 7000, 8500, 10000],
};

const expectedReserved = {
  "stage-0": [],
  "stage-1": [
    "ui.checkbox",
    "ui.checkbox-group",
    "ui.radio",
    "ui.radio-group",
    "ui.switch",
    "ui.select",
    "ui.select-item",
    "ui.select-section",
    "ui.combo-box",
    "ui.list-box",
    "ui.list-box-item",
    "ui.list-box-section",
  ],
  "stage-2": [
    "ui.menu",
    "ui.menu-trigger",
    "ui.menu-item",
    "ui.menu-section",
    "ui.menu-separator",
    "ui.menu-checkbox-item",
    "ui.menu-radio-item",
    "ui.popover",
    "ui.tooltip",
    "ui.disclosure",
    "ui.accordion",
  ],
  "stage-3": [
    "ui.breadcrumbs",
    "ui.breadcrumb-item",
    "ui.pagination",
    "ui.table",
    "ui.data-grid",
    "ui.progress",
  ],
};

test("bundle policy pins exact cumulative package and catalog allocations", () => {
  validateBundlePolicy(BUNDLE_POLICY);
  assert.deepEqual(BUNDLE_POLICY.reservedCatalogIds, expectedReserved);
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(BUNDLE_POLICY.packages).map(([name, budget]) => [
        name,
        [
          budget.baseline,
          budget.unplanned,
          budget["stage-0"],
          budget["stage-1"],
          budget["stage-2"],
          budget["stage-3"],
        ],
      ]),
    ),
    expectedBudgets,
  );
});

test("bundle policy fails closed for malformed or raised source policy", () => {
  const changed = structuredClone(BUNDLE_POLICY);
  changed.packages.mcp["stage-3"] += 1;
  assert.throws(() => validateBundlePolicy(changed), /policy digest mismatch/);

  const duplicate = structuredClone(BUNDLE_POLICY);
  duplicate.reservedCatalogIds["stage-1"].push("ui.checkbox");
  assert.throws(() => validateBundlePolicy(duplicate), /Duplicate catalog ID/);

  const duplicatePackageSource = JSON.stringify(BUNDLE_POLICY).replace(
    '"tokens":{',
    '"tokens":{},"tokens":{',
  );
  assert.throws(
    () => validateBundlePolicy(BUNDLE_POLICY, duplicatePackageSource),
    /Duplicate package policy entry: tokens/,
  );
});

test("changed catalog IDs use only reserved cumulative stage allocations", () => {
  assert.deepEqual(
    resolveBudgetMode({
      stage: "stage-1",
      addedCatalogIds: ["ui.checkbox"],
      changedCatalogIds: [],
    }),
    { mode: "stage-1", catalogIds: ["ui.checkbox"] },
  );
  assert.deepEqual(
    resolveBudgetMode({
      stage: "stage-1",
      addedCatalogIds: [],
      changedCatalogIds: ["ui.button"],
    }),
    { mode: "stage-1", catalogIds: [] },
  );
  assert.throws(
    () =>
      resolveBudgetMode({
        stage: "stage-1",
        addedCatalogIds: ["ui.unplanned"],
        changedCatalogIds: [],
      }),
    /not reserved/,
  );
  assert.equal(
    resolveBudgetMode({
      stage: "stage-0",
      addedCatalogIds: [],
      changedCatalogIds: [],
      comparisonProvided: false,
    }).mode,
    "stage-0",
  );
  assert.equal(
    resolveBudgetMode({
      stage: "stage-1",
      addedCatalogIds: [],
      changedCatalogIds: [],
      comparisonProvided: false,
    }).mode,
    "unplanned",
  );
});

test("oversized or unknown package measurements fail without changing policy", () => {
  const before = JSON.stringify(BUNDLE_POLICY);
  assert.throws(
    () =>
      assertWithinBudgets(
        [{ name: "cli", bytes: 15001, files: [] }],
        "stage-0",
      ),
    /ceiling is 15000/,
  );
  assert.throws(
    () =>
      assertWithinBudgets(
        [{ name: "unknown", bytes: 1, files: [] }],
        "stage-0",
      ),
    /Unknown bundle package/,
  );
  assert.equal(JSON.stringify(BUNDLE_POLICY), before);
});

test("bundle measurement is deterministic and rejects symlinked artifacts", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-bundle-test-"));
  await mkdir(join(root, "dist"));
  await writeFile(
    join(root, "dist", "index.js"),
    "export const candy = true;\n",
  );
  await writeFile(
    join(root, "dist", "index.d.ts"),
    "export declare const candy: true;\n",
  );
  await writeFile(join(root, "dist", "index.js.map"), "{}");

  const first = await measurePackageDirectory(root);
  const second = await measurePackageDirectory(root);
  assert.deepEqual(first, second);
  assert.deepEqual(
    first.files.map(({ path }) => path),
    ["index.js"],
  );

  await symlink(
    join(root, "dist", "index.js"),
    join(root, "dist", "linked.js"),
  );
  await assert.rejects(() => measurePackageDirectory(root), /symbolic link/);
});

test("bundle report writes only the exact requested new path", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-bundle-report-"));
  const target = join(root, "reports", "stage-0.json");
  await writeBundleReport(target, { schemaVersion: 1, packages: [] });
  assert.deepEqual(JSON.parse(await readFile(target, "utf8")), {
    schemaVersion: 1,
    packages: [],
  });
  await assert.rejects(
    () => writeBundleReport(target, { schemaVersion: 1, packages: [] }),
    /already exists/,
  );

  assert.equal(
    resolveBundleReportPath(".artifacts/bundles/stage-0.json", root),
    join(root, ".artifacts/bundles/stage-0.json"),
  );
  assert.throws(
    () => resolveBundleReportPath(".artifacts/outside.json", root),
    /direct \.artifacts\/bundles/,
  );
});
