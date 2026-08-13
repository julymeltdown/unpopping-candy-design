import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("historical QA evidence cannot be mistaken for current release readiness", async () => {
  // Given: the repository retains its pre-Stage-0 QA report for provenance.
  const source = await readFile(
    new URL("../../docs/QA_REPORT.md", import.meta.url),
    "utf8",
  );

  // When: a reader opens the report without history context.
  // Then: the document identifies its exact snapshot and superseded status.
  assert.match(source, /^# Historical /);
  assert.match(
    source,
    /Snapshot commit: `d535eba3bb7208067729302b2c109ed095a74eed`/,
  );
  assert.match(source, /Superseded by the Stage 0 verification evidence/);
  assert.doesNotMatch(source, /publishable packages\s+11/);
  assert.doesNotMatch(source, /## 16\. Current release decision/);
});
