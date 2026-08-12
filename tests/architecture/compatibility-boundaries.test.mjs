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
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { publicPackageNames } from "../../scripts/lib/compatibility-contract.mjs";
import { executeCompatibilityRun } from "../../scripts/lib/compatibility-execution.mjs";
import { runCompatibilityProcess } from "../../scripts/lib/compatibility-process.mjs";
import { runCompatibilityMatrix } from "../../scripts/run-compatibility-matrix.mjs";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const matrixPath = join(workspaceRoot, "fixtures/compatibility/matrix.json");
const controllerSource =
  "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000);";

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

test("compatibility process awaits forced Windows tree-kill completion", async () => {
  // Given: a Windows termination seam whose forced tree killer stays pending.
  const root = await mkdtemp(join(tmpdir(), "popcandy-windows-kill-"));
  const controller = join(root, "controller.mjs");
  await writeFile(controller, controllerSource);
  const forcedStarted = Promise.withResolvers();
  const forcedCompleted = Promise.withResolvers();
  const terminateTree = ({ child, signal }) => {
    if (signal === "SIGKILL") {
      child.kill(signal);
      forcedStarted.resolve();
      return forcedCompleted.promise;
    }
    return Promise.resolve();
  };
  try {
    // When: timeout escalation starts but its tree killer has not completed.
    const operation = runCompatibilityProcess({
      command: process.execPath,
      args: [controller],
      cwd: root,
      timeoutMs: 20,
      killGraceMs: 20,
      treeKillTimeoutMs: 1_000,
      terminateTree,
    });
    const observed = operation.then(
      () => ({ kind: "resolved" }),
      (error) => ({ kind: "rejected", error }),
    );
    await Promise.race([
      forcedStarted.promise,
      new Promise((_, rejectPromise) =>
        setTimeout(
          () =>
            rejectPromise(new TypeError("Termination seam was not invoked.")),
          1_000,
        ),
      ),
    ]);
    const state = await Promise.race([
      observed.then(() => "settled"),
      Promise.resolve("pending"),
    ]);

    // Then: the process promise settles only after the forced killer completes.
    assert.equal(state, "pending");
    forcedCompleted.resolve();
    const outcome = await observed;
    assert.equal(outcome.kind, "rejected");
    assert.match(outcome.error.message, /timed out/);
  } finally {
    forcedCompleted.resolve();
    await rm(root, { recursive: true, force: true });
  }
});

test("compatibility process bounds a non-settling tree killer", async () => {
  // Given: an injected tree killer that never reports completion.
  const root = await mkdtemp(join(tmpdir(), "popcandy-killer-timeout-"));
  const controller = join(root, "controller.mjs");
  await writeFile(controller, controllerSource);
  let calls = 0;
  const terminateTree = ({ child, signal }) => {
    calls += 1;
    if (signal === "SIGKILL") child.kill(signal);
    return new Promise(() => {});
  };
  try {
    // When: timeout escalation encounters the non-settling killer.
    const operation = runCompatibilityProcess({
      command: process.execPath,
      args: [controller],
      cwd: root,
      timeoutMs: 20,
      killGraceMs: 20,
      treeKillTimeoutMs: 30,
      terminateTree,
    });

    // Then: both termination attempts are bounded and failure is explicit.
    await assert.rejects(operation, /tree termination timed out/);
    assert.equal(calls, 2);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("external artifact results return their real root-relative locator", async () => {
  // Given: an artifact root outside the workspace and pass/failure results.
  const artifactRoot = await mkdtemp(join(tmpdir(), "popcandy-results-"));
  const run = {
    fixture: "base",
    cell: "vite-react-19",
    manager: "pnpm-11",
  };
  const execution = await import(
    "../../scripts/lib/compatibility-execution.mjs"
  );
  try {
    for (const status of ["passed", "failed"]) {
      // When: the shared result writer persists each outcome.
      const result = { status };
      const resultPath = await execution.writeCompatibilityResult(
        artifactRoot,
        run,
        result,
      );

      // Then: the POSIX locator resolves under artifactRoot to the actual file.
      assert.equal(resultPath, "base/vite-react-19/pnpm-11.json");
      assert.doesNotMatch(resultPath, /\\|\.\.|Users|private/);
      assert.deepEqual(
        JSON.parse(
          await readFile(join(artifactRoot, ...resultPath.split("/")), "utf8"),
        ),
        result,
      );
    }
  } finally {
    await rm(artifactRoot, { recursive: true, force: true });
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
    const serialized = JSON.stringify(result);
    assert.doesNotMatch(serialized, /Users|\/private\/|credential|token=/i);
  } finally {
    if (previousTmpdir === undefined) delete process.env.TMPDIR;
    else process.env.TMPDIR = previousTmpdir;
    await rm(root, { recursive: true, force: true });
  }
});
