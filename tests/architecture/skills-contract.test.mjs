import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  inspectSkillDirectory,
  parseSkillMarkdown,
} from "../../scripts/lib/skills-contract.mjs";

test("portable Skills use exact Node support and explicit project paths", async () => {
  const skillsRoot = new URL("../../skills/", import.meta.url);
  const directories = await readdir(skillsRoot, { withFileTypes: true });
  const sources = await Promise.all(
    directories
      .filter((entry) => entry.isDirectory())
      .map((entry) =>
        readFile(new URL(`${entry.name}/SKILL.md`, skillsRoot), "utf8"),
      ),
  );
  for (const source of sources) {
    assert.doesNotMatch(source, /Node(?:\.js)? 22\+/);
    assert.doesNotMatch(source, /popcandy validate \. --json/);
    if (source.includes("Node.js")) {
      assert.match(source, /Node\.js >=22\.13\.0 <23 or >=24 <25/);
    }
  }
});

test("skill parser reads required and nested metadata", () => {
  const parsed = parseSkillMarkdown(
    `---\nname: example-skill\ndescription: Use for examples.\nmetadata:\n  version: "1.2.3"\n---\n\n# Example\n`,
  );
  assert.equal(parsed.frontmatter.name, "example-skill");
  assert.equal(parsed.frontmatter.metadata.version, "1.2.3");
});

test("skill inspection rejects mismatched names and missing references", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-skill-"));
  const skill = join(root, "valid-name");
  await mkdir(join(skill, "references"), { recursive: true });
  await writeFile(
    join(skill, "SKILL.md"),
    `---\nname: wrong-name\ndescription: Use for a fixture.\nmetadata:\n  version: "1.0.0"\n---\n\n# Fixture\n\nRead [missing](references/missing.md).\n`,
  );
  const result = await inspectSkillDirectory(skill);
  assert.ok(result.errors.some((error) => error.includes("match directory")));
  assert.ok(result.errors.some((error) => error.includes("missing reference")));
});
