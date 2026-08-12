import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import {
  bundledCatalog,
  getCatalogEntry,
  searchCatalog,
  validateCatalog,
} from "../src/index.ts";
import { publicContractErrors } from "./public-example-contract.ts";

test("bundled catalog contains every stable public surface", () => {
  assert.equal(
    bundledCatalog.entries.filter((entry) => entry.kind === "component").length,
    32,
  );
  assert.equal(
    bundledCatalog.entries.filter((entry) => entry.kind === "pattern").length,
    6,
  );
  assert.equal(
    bundledCatalog.entries.filter((entry) => entry.kind === "template").length,
    5,
  );
  assert.equal(
    bundledCatalog.entries.filter((entry) => entry.kind === "migration").length,
    1,
  );
  assert.deepEqual(validateCatalog(bundledCatalog), []);
});

test("bundled catalog exposes version-aware component guidance", () => {
  const button = getCatalogEntry(bundledCatalog, "Button");
  assert.equal(button?.id, "ui.button");
  assert.equal(button?.version, "0.1.0");
  assert.equal(button?.kind, "component");
  if (button?.kind !== "component")
    throw new Error("Button metadata must be a component.");
  assert.ok(button.entrypoints.includes("@unpopping-candy/ui/button"));
  assert.ok(button.accessibility.requirements.length >= 2);
  assert.ok(button.stories.includes("catalog-ui-button--contract"));
});

test("search returns product patterns as well as components", () => {
  const results = searchCatalog(bundledCatalog, "social feed");
  assert.ok(results.some((result) => result.id === "pattern.social-feed"));
  assert.ok(results.some((result) => result.id === "social.timeline-view"));
});

test("bundled component contracts include compiler-extracted public props", () => {
  const button = bundledCatalog.entries.find(
    (entry) => entry.id === "ui.button",
  );
  assert.ok(button && button.kind === "component");
  if (button.kind !== "component") return;
  assert.equal(button.nativeElement, "button");
  assert.ok(
    button.props.some(
      (prop) => prop.name === "pending" && prop.required === false,
    ),
  );
  assert.ok(button.props.some((prop) => prop.name === "leadingIcon"));
});

test("all preferred examples and Registry TSX templates honor public component props", async () => {
  const examples = bundledCatalog.entries.flatMap((entry) =>
    entry.kind === "component"
      ? entry.examples.preferred.map(
          (example, index) =>
            [
              example.code,
              `${entry.id} preferred example ${index + 1}`,
              entry.name,
            ] as const,
        )
      : [],
  );
  const templates = bundledCatalog.entries.flatMap((entry) =>
    entry.kind === "template"
      ? entry.files
          .filter((file) => file.source.endsWith(".tsx"))
          .map((file) => [file.source, `${entry.id} ${file.path}`] as const)
      : [],
  );
  const errors = examples.flatMap(([code, label, name]) =>
    publicContractErrors(code, label, name),
  );
  for (const [path, label] of templates) {
    errors.push(
      ...publicContractErrors(await readFile(resolve(path), "utf8"), label),
    );
  }
  assert.deepEqual(errors, []);
});
