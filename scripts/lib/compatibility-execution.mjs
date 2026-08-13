import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, sep } from "node:path";
import {
  assertObservedVersions,
  assertOutsideWorkspace,
  createCompatibilityResult,
} from "./compatibility-contract.mjs";
import {
  installConsumerManagerFiles,
  smokeTestCompatibilityBuild,
  writeCompatibilityConsumer,
} from "./compatibility-consumer.mjs";
import {
  createManagerInvocation,
  readInstalledVersion,
  runCompatibilityProcess,
} from "./compatibility-process.mjs";

export async function writeCompatibilityResult(artifactRoot, run, result) {
  const resultPath = join(
    artifactRoot,
    run.fixture,
    run.cell,
    `${run.manager}.json`,
  );
  await mkdir(dirname(resultPath), { recursive: true });
  await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`);
  const locator = relative(artifactRoot, resultPath);
  if (!locator || locator.startsWith("..")) {
    throw new TypeError("Compatibility result escaped the artifact root.");
  }
  return locator.split(sep).join("/");
}
async function assertInstalledIsolation({
  consumerRoot,
  workspaceRoot,
  tarballs,
}) {
  const rootNodeModules = await realpath(join(workspaceRoot, "node_modules"));
  for (const tarball of tarballs) {
    const location = await realpath(
      join(consumerRoot, "node_modules", ...tarball.packageName.split("/")),
    );
    await assertOutsideWorkspace(
      workspaceRoot,
      location,
      `Installed ${tarball.packageName}`,
    );
    await assertOutsideWorkspace(
      rootNodeModules,
      location,
      `Installed ${tarball.packageName}`,
    );
  }
}
export async function executeCompatibilityRun(context, run) {
  const {
    workspaceRoot,
    artifactRoot,
    matrix,
    packed,
    keepTemporary,
    environment,
  } = context;
  const cell = matrix.cells[run.cell];
  const manager = matrix.managers[run.manager];
  const result = createCompatibilityResult({
    run,
    cell,
    manager,
    tarballs: packed.tarballs,
  });
  const temporaryRoot = await mkdtemp(join(tmpdir(), "popcandy-consumer-"));
  const consumerRoot = join(temporaryRoot, "consumer");
  const packsRoot = join(temporaryRoot, "packs");
  let temporaryApproved = false;
  try {
    await assertOutsideWorkspace(
      workspaceRoot,
      temporaryRoot,
      "Temporary consumer",
    );
    temporaryApproved = true;
    result.audit.temporaryRootOutsideWorkspace = true;
    await Promise.all([mkdir(consumerRoot), mkdir(packsRoot)]);
    const tarballs = [];
    for (const tarball of packed.tarballs) {
      const path = join(packsRoot, tarball.name);
      await copyFile(tarball.path, path);
      tarballs.push({ ...tarball, path });
    }
    const fixtureRoot = join(workspaceRoot, "fixtures/compatibility");
    const scenarioSource = await readFile(
      join(fixtureRoot, "scenarios", `${run.fixture}.tsx`),
      "utf8",
    );
    const expectedName = scenarioSource.match(
      /expectedAccessibleName\s*=\s*["']([^"']+)["']/,
    )?.[1];
    if (!expectedName) {
      throw new TypeError(`Fixture ${run.fixture} has no accessible name.`);
    }
    const consumer = await writeCompatibilityConsumer({
      consumerRoot,
      fixtureRoot,
      scenarioSource,
      cell,
      tarballs,
    });
    await installConsumerManagerFiles({ consumerRoot, manager, tarballs });
    result.audit.managerResolution.publicPackagePins =
      consumer.publicPackagePins;
    result.audit.manifestDependencies = consumer.dependencies;
    result.audit.scenarioImports = consumer.imports;
    const invocation = createManagerInvocation(manager);

    result.stage = "manager-version";
    const version = await runCompatibilityProcess({
      command: invocation.command,
      args: invocation.versionArgs,
      cwd: consumerRoot,
      timeoutMs: 120_000,
      environment,
      homeRoot: temporaryRoot,
    });
    result.packageManager.observedVersion = version.output.split("\n").at(-1);
    if (result.packageManager.observedVersion !== manager.version) {
      throw new TypeError(
        `Expected ${manager.version}, received ${result.packageManager.observedVersion}.`,
      );
    }

    result.stage = "install";
    const install = await runCompatibilityProcess({
      command: invocation.command,
      args: invocation.installArgs,
      cwd: consumerRoot,
      timeoutMs: 600_000,
      environment,
      homeRoot: temporaryRoot,
    });
    result.install = { status: "passed", durationMs: install.durationMs };
    await assertInstalledIsolation({ consumerRoot, workspaceRoot, tarballs });
    result.audit.tarballOnlyPublicPackages = true;
    result.stage = "version-audit";
    const frameworkPackage =
      cell.framework === "react-router" ? "react-router" : cell.framework;
    result.framework.observedVersion = await readInstalledVersion(
      consumerRoot,
      frameworkPackage,
    );
    result.react.observedVersion = await readInstalledVersion(
      consumerRoot,
      "react",
    );
    assertObservedVersions(cell, {
      frameworkVersion: result.framework.observedVersion,
      reactVersion: result.react.observedVersion,
    });

    result.stage = "typecheck";
    const typeVersion = await runCompatibilityProcess({
      command: process.execPath,
      args: ["node_modules/typescript/bin/tsc", "--version"],
      cwd: consumerRoot,
      timeoutMs: 30_000,
      environment,
      homeRoot: temporaryRoot,
    });
    result.typescript.observedVersion = typeVersion.output.replace(
      "Version ",
      "",
    );
    if (result.typescript.observedVersion !== "5.7.3") {
      throw new TypeError(
        `Expected TypeScript 5.7.3, received ${typeVersion.output}.`,
      );
    }
    const typecheck = await runCompatibilityProcess({
      command: process.execPath,
      args: ["node_modules/typescript/bin/tsc", "--noEmit"],
      cwd: consumerRoot,
      environment,
      homeRoot: temporaryRoot,
    });
    result.typecheck = {
      status: "passed",
      durationMs: typecheck.durationMs,
    };
    result.typescript.status = "passed";
    result.typescript.durationMs = typecheck.durationMs;

    result.stage = "build";
    const build = await runCompatibilityProcess({
      command: process.execPath,
      args: consumer.generated.build,
      cwd: consumerRoot,
      timeoutMs: 600_000,
      environment,
      homeRoot: temporaryRoot,
    });
    result.build = { status: "passed", durationMs: build.durationMs };

    result.stage = "smoke-test";
    const smoke = await smokeTestCompatibilityBuild({
      consumerRoot,
      generated: consumer.generated,
      expectedName,
      environment,
    });
    result.browser.observedVersion = smoke.browserVersion;
    result.browser.accessibleName = expectedName;
    result.smokeTest = { status: "passed", durationMs: smoke.durationMs };
    result.status = "passed";
    result.stage = "complete";
    const resultPath = await writeCompatibilityResult(
      artifactRoot,
      run,
      result,
    );
    return { resultPath, result };
  } catch (error) {
    result.status = "failed";
    const outcome =
      result.stage === "smoke-test" ? result.smokeTest : result[result.stage];
    if (outcome && typeof outcome === "object" && "status" in outcome) {
      outcome.status = "failed";
    }
    await writeCompatibilityResult(artifactRoot, run, result);
    throw error;
  } finally {
    if (!keepTemporary || !temporaryApproved) {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }
}
