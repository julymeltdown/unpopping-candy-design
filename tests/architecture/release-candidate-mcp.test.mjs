import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { rewriteCandidateMcpReadme } from "../../scripts/prepare-release-candidate.mjs";

test("candidate metadata rewrites packaged MCP launch instructions", async () => {
  // Given: a source-only MCP README with one candidate injection boundary.
  const root = await mkdtemp(join(tmpdir(), "popcandy-candidate-mcp-"));
  await mkdir(join(root, "packages/mcp"), { recursive: true });
  await writeFile(
    join(root, "packages/mcp/README.md"),
    "Local source instructions.\n\n<!-- POPCANDY_CANDIDATE_MCP_COMMAND -->\n",
  );

  // When: candidate metadata is rewritten to the exact prerelease version.
  await rewriteCandidateMcpReadme(root, "0.3.0-alpha.0");

  // Then: the packaged README advertises that version once, without a marker.
  const readme = await readFile(join(root, "packages/mcp/README.md"), "utf8");
  assert.match(
    readme,
    /"args": \["-y", "@unpopping-candy\/mcp@0\.3\.0-alpha\.0"\]/,
  );
  assert.doesNotMatch(readme, /POPCANDY_CANDIDATE_MCP_COMMAND/);
});
