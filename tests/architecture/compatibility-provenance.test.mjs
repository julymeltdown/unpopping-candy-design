import assert from "node:assert/strict";
import test from "node:test";
import { createCompatibilityResult } from "../../scripts/lib/compatibility-contract.mjs";

test("compatibility receipts bind the exact source commit", () => {
  // Given: one planned run and its exact source revision.
  const sourceCommit = "a".repeat(40);

  // When: the runner creates the durable compatibility result.
  const result = createCompatibilityResult({
    run: {
      id: "base/vite-react-19/pnpm-11",
      cell: "vite-react-19",
      manager: "pnpm-11",
    },
    cell: {
      framework: "vite",
      frameworkVersion: "8.1.0",
      reactVersion: "19.2.8",
    },
    manager: { version: "11.21.0" },
    tarballs: [],
    sourceCommit,
  });

  // Then: the receipt carries the full revision without projection.
  assert.equal(result.sourceCommit, sourceCommit);
});
