import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = new URL("../..", import.meta.url).pathname;

function pureLineCount(source) {
  return source.split(/\r?\n/).filter((line) => {
    const trimmed = line.trim();
    return (
      trimmed &&
      !trimmed.startsWith("//") &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("--")
    );
  }).length;
}

test("hand-authored source and test modules stay within the reviewable size ceiling", async () => {
  const { stdout } = await execFileAsync(
    "git",
    [
      "ls-files",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      "*.ts",
      "*.tsx",
      "*.js",
      "*.mjs",
    ],
    { cwd: root, encoding: "utf8" },
  );
  const paths = stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((path) => !path.includes("/src/generated/"));
  const counts = await Promise.all(
    paths.map(async (path) => [
      path,
      pureLineCount(await readFile(join(root, path), "utf8")),
    ]),
  );
  const oversized = counts.filter(([, count]) => count > 250);

  assert.deepEqual(
    oversized,
    [],
    `Hand-authored modules must not exceed 250 pure lines:\n${oversized.map(([path, count]) => `${count} ${path}`).join("\n")}`,
  );
});
