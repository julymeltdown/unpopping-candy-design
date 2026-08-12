import assert from "node:assert/strict";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { publicPackageNames } from "../../scripts/lib/compatibility-contract.mjs";
import { executeCompatibilityRun } from "../../scripts/lib/compatibility-execution.mjs";
import { runCompatibilityProcess } from "../../scripts/lib/compatibility-process.mjs";
import { runCompatibilityMatrix } from "../../scripts/run-compatibility-matrix.mjs";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const matrixPath = join(workspaceRoot, "fixtures/compatibility/matrix.json");

test("compatibility process bounds output and terminates the process tree", async () => {
  // Given: a controller that emits excess output and leaves a grandchild alive.
  const root = await mkdtemp(join(tmpdir(), "popcandy-process-"));
  const pidPath = join(root, "grandchild.pid");
  const scriptPath = join(root, "controller.mjs");
  await writeFile(
    scriptPath,
    `import { spawn } from "node:child_process"; import { writeFileSync } from "node:fs"; const child = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { stdio: "ignore" }); writeFileSync(${JSON.stringify(pidPath)}, String(child.pid)); if (process.argv[2] === "output") process.stdout.write("x".repeat(4096)); setInterval(() => {}, 1000);`,
  );
  try {
    // When: output and timeout limits terminate the controller.
    for (const mode of ["output", "timeout"]) {
      let failure;
      try {
        await runCompatibilityProcess({
          command: process.execPath,
          args: [scriptPath, mode],
          cwd: root,
          timeoutMs: mode === "timeout" ? 150 : 5_000,
          outputLimitBytes: 512,
          killGraceMs: 50,
        });
      } catch (error) {
        failure = error;
      }
      // Then: diagnostics are bounded and the whole process tree is gone.
      assert.ok(failure instanceof Error);
      assert.ok(Buffer.byteLength(failure.output ?? "") <= 512);
      const pid = Number(await readFile(pidPath, "utf8"));
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
      assert.throws(() => process.kill(pid, 0), { code: "ESRCH" });
    }
  } finally {
    try {
      process.kill(Number(await readFile(pidPath, "utf8")), "SIGKILL");
    } catch {
      // The expected cleanup path has already removed the grandchild.
    }
    await rm(root, { recursive: true, force: true });
  }
});

test("supplied packed artifacts fail closed before consumer mutation", async () => {
  // Given: a supplied artifact set missing all nine public packages.
  const root = await mkdtemp(join(tmpdir(), "popcandy-boundary-"));
  const artifactRoot = join(root, "artifacts");
  try {
    // When: the reusable runner validates the supplied packed boundary.
    await assert.rejects(
      runCompatibilityMatrix({
        workspaceRoot,
        artifactRoot,
        fixture: "base",
        cell: "vite-react-19",
        manager: "pnpm-11",
        packed: { root, tarballs: [] },
      }),
      /exactly nine public tarballs/,
    );
    // Then: no result or consumer artifact was created.
    await assert.rejects(access(artifactRoot));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("failure results retain complete evidence and clean unsafe temp roots", async () => {
  // Given: TMPDIR resolves inside the workspace boundary.
  const root = await mkdtemp(join(tmpdir(), "popcandy-failure-"));
  const tempRoot = join(root, "temporary");
  const artifactRoot = join(root, "artifacts");
  const previousTmpdir = process.env.TMPDIR;
  await mkdir(tempRoot);
  process.env.TMPDIR = tempRoot;
  const matrix = JSON.parse(await readFile(matrixPath, "utf8"));
  const run = {
    id: "base/vite-react-19/pnpm-11",
    fixture: "base",
    cell: "vite-react-19",
    manager: "pnpm-11",
  };
  const tarballs = publicPackageNames.map((packageName, index) => ({
    packageName,
    name: `package-${index}.tgz`,
    sha256: String(index).padStart(64, "0"),
  }));
  try {
    // When: execution rejects before consumer content is written.
    await assert.rejects(
      executeCompatibilityRun(
        {
          workspaceRoot: root,
          artifactRoot,
          matrix,
          packed: { tarballs },
          keepTemporary: true,
        },
        run,
      ),
      /outside the workspace/,
    );
    const result = JSON.parse(
      await readFile(
        join(artifactRoot, "base/vite-react-19/pnpm-11.json"),
        "utf8",
      ),
    );
    // Then: the failure is complete, sanitized, and the unsafe temp root is gone.
    assert.equal(
      `${result.status}/${result.stage}/${result.node}`,
      `failed/prepare/${process.version}`,
    );
    assert.deepEqual(
      ["install", "typecheck", "build", "smokeTest"].map(
        (key) => result[key].status,
      ),
      Array(4).fill("not-run"),
    );
    assert.equal(result.packageManager.expectedVersion, "11.21.0");
    assert.equal(result.framework.expectedVersion, "8.1.0");
    assert.equal(result.react.expectedVersion, "19.2.8");
    assert.deepEqual(result.tarballs, tarballs);
    assert.deepEqual(await readdir(tempRoot), []);
    assert.doesNotMatch(
      JSON.stringify(result),
      /Users|\/private\/|credential|token=/i,
    );
  } finally {
    if (previousTmpdir === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = previousTmpdir;
    await rm(root, { recursive: true, force: true });
  }
});
