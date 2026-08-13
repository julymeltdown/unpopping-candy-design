import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readDocument = (path) =>
  readFile(new URL(`../../${path}`, import.meta.url), "utf8");

test("package and case-study guidance preserve exact runtime and CLI syntax", async () => {
  const [cliReadme, study, preview] = await Promise.all([
    readDocument("packages/cli/README.md"),
    readDocument("docs/AI_ASSISTED_POST_CASE_STUDY.md"),
    readDocument("docs/preview/index.html"),
  ]);
  assert.match(cliReadme, /Node `>=22\.13\.0 <23 \|\| >=24 <25`/);
  assert.match(cliReadme, /popcandy validate --path \. --json/);
  assert.doesNotMatch(cliReadme, /popcandy validate \. --json/);
  assert.match(study, /Node `>=22\.13\.0 <23 \|\| >=24 <25`/);
  assert.doesNotMatch(study, /Node `>=22\.13\.0`/);
  assert.match(preview, /popcandy\s+validate --path \. --json/);
});
