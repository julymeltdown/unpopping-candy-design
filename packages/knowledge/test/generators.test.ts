import assert from "node:assert/strict";
import test from "node:test";
import {
  bundledCatalog,
  generateAgentDocumentSet,
  generateComponentMarkdown,
  generateDesignMarkdown,
  generateLlmsFiles,
} from "../src/index.ts";
import tokens from "../../tokens/src/tokens.json" with { type: "json" };

test("design document is generated from the catalog and machine-readable tokens", () => {
  const output = generateDesignMarkdown(bundledCatalog, tokens);
  assert.match(output, /^---\nschema:/);
  assert.match(output, /stableComponents: 32/);
  assert.match(output, /## Agent operating contract/);
  assert.match(output, /\[Button\]\(\.\/agent\/components\/ui\.button\.md\)/);
});

test("design generation rejects malformed semantic token values", () => {
  assert.throws(
    () =>
      generateDesignMarkdown(bundledCatalog, {
        color: { semantic: { canvas: { $value: 42 } } },
      }),
    /canvas.*string/i,
  );
});

test("portable agent documents enumerate the coordinated nine-package public surface", () => {
  const packageNames = [
    "@unpopping-candy/tokens",
    "@unpopping-candy/theme",
    "@unpopping-candy/icons",
    "@unpopping-candy/ui",
    "@unpopping-candy/social",
    "@unpopping-candy/knowledge",
    "@unpopping-candy/registry",
    "@unpopping-candy/cli",
    "@unpopping-candy/mcp",
  ];
  const design = generateDesignMarkdown(bundledCatalog, tokens);
  const llms = generateLlmsFiles(bundledCatalog, tokens);
  const small = llms.find(
    (file) => file.path === "agent/llms-small.txt",
  )?.content;
  const full = llms.find(
    (file) => file.path === "agent/llms-full.txt",
  )?.content;
  assert.ok(small && full);
  for (const packageName of packageNames) {
    assert.match(design, new RegExp(packageName.replace("/", "\\/")));
    assert.match(small, new RegExp(packageName.replace("/", "\\/")));
    assert.match(full, new RegExp(packageName.replace("/", "\\/")));
  }
});

test("component document includes operational and accessibility guidance", () => {
  const button = bundledCatalog.entries.find(
    (entry) => entry.id === "ui.button",
  );
  if (!button || button.kind !== "component")
    throw new Error("Missing Button metadata.");
  const output = generateComponentMarkdown(button);
  assert.match(output, /## Use when/);
  assert.match(output, /## Avoid when/);
  assert.match(output, /## Accessibility/);
  assert.match(output, /catalog-ui-button--contract/);
});

test("agent document set is deterministic and has unique paths", () => {
  const first = generateAgentDocumentSet(bundledCatalog, tokens);
  const second = generateAgentDocumentSet(bundledCatalog, tokens);
  assert.deepEqual(first, second);
  assert.equal(new Set(first.map((file) => file.path)).size, first.length);
  assert.equal(
    first.filter((file) => file.path.startsWith("agent/components/")).length,
    32,
  );
});
