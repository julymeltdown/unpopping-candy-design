import assert from "node:assert/strict";
import test from "node:test";
import { bundledCatalog } from "../src/index.ts";

test("documented variant aliases stay unique and exact", () => {
  for (const entry of bundledCatalog.entries) {
    if (entry.kind !== "component") continue;
    const names = entry.variants.map(({ name }) => name);
    assert.equal(new Set(names).size, names.length, entry.id);
    if (entry.id === "ui.button")
      assert.deepEqual(names, ["primary", "secondary", "ghost", "danger"]);
  }
});
