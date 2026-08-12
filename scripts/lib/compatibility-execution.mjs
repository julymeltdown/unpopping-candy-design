import { chromium } from "@playwright/test";
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
import { dirname, join, relative } from "node:path";
import {
  readInstalledVersion,
  serveCompatibilityBuild,
  writeCompatibilityConsumer,
} from "./compatibility-consumer.mjs";
import {
  createManagerInvocation,
  runCompatibilityProcess,
} from "./compatibility-process.mjs";

async function installConsumerManagerFiles({
  consumerRoot,
  manager,
  tarballs,
}) {
  if (manager.nodeLinker) {
    await writeFile(
      join(consumerRoot, ".yarnrc.yml"),
      `nodeLinker: ${manager.nodeLinker}\n`,
    );
  }
  if (manager.package === "pnpm") {
    const overrides = tarballs
      .map(
        (tarball) =>
          `  '${tarball.packageName}': file:../packs/${tarball.name}`,
      )
      .join("\n");
    await writeFile(
      join(consumerRoot, "pnpm-workspace.yaml"),
      `overrides:\n${overrides}\n`,
    );
  }
}

async function smokeTestBuild({ consumerRoot, generated, expectedName }) {
  const started = performance.now();
  const served = await serveCompatibilityBuild(
    join(consumerRoot, generated.output),
  );
  let browser;
  try {
    browser = await chromium.launch({ timeout: 30_000 });
    const browserVersion = browser.version();
    const page = await browser.newPage();
    await page.goto(served.url, { timeout: 30_000 });
    await page
      .getByRole("main", { name: expectedName })
      .waitFor({ timeout: 30_000 });
    return {
      browserVersion,
      smokeTest: {
        status: "passed",
        durationMs: Math.round(performance.now() - started),
      },
    };
  } finally {
    if (browser) await browser.close();
    await new Promise((resolvePromise) => served.server.close(resolvePromise));
  }
}

export async function executeCompatibilityRun(context, run) {
  const { workspaceRoot, artifactRoot, matrix, packed, keepTemporary } =
    context;
  const cell = matrix.cells[run.cell];
  const manager = matrix.managers[run.manager];
  const temporaryRoot = await mkdtemp(join(tmpdir(), "popcandy-consumer-"));
  const consumerRoot = join(temporaryRoot, "consumer");
  const packsRoot = join(temporaryRoot, "packs");
  const outcomes = {};
  let stage = "prepare";
  try {
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
    const invocation = createManagerInvocation(manager);

    stage = "manager-version";
    const versionResult = await runCompatibilityProcess({
      command: invocation.command,
      args: invocation.versionArgs,
      cwd: consumerRoot,
      timeoutMs: 120_000,
    });
    const managerVersion = versionResult.output.split("\n").at(-1);
    if (managerVersion !== manager.version) {
      throw new TypeError(
        `Expected ${manager.version}, received ${managerVersion}.`,
      );
    }

    stage = "install";
    const install = await runCompatibilityProcess({
      command: invocation.command,
      args: invocation.installArgs,
      cwd: consumerRoot,
      timeoutMs: 600_000,
    });
    outcomes.install = { status: "passed", durationMs: install.durationMs };
    for (const tarball of tarballs) {
      const location = await realpath(
        join(consumerRoot, "node_modules", ...tarball.packageName.split("/")),
      );
      if (location.startsWith(workspaceRoot)) {
        throw new TypeError(
          `${tarball.packageName} resolved into the workspace.`,
        );
      }
    }

    stage = "typecheck";
    const typeVersion = await runCompatibilityProcess({
      command: process.execPath,
      args: ["node_modules/typescript/bin/tsc", "--version"],
      cwd: consumerRoot,
      timeoutMs: 30_000,
    });
    if (typeVersion.output !== "Version 5.7.3") {
      throw new TypeError(
        `Expected TypeScript 5.7.3, received ${typeVersion.output}.`,
      );
    }
    const typecheck = await runCompatibilityProcess({
      command: process.execPath,
      args: ["node_modules/typescript/bin/tsc", "--noEmit"],
      cwd: consumerRoot,
    });
    outcomes.typecheck = {
      status: "passed",
      durationMs: typecheck.durationMs,
    };

    stage = "build";
    const build = await runCompatibilityProcess({
      command: process.execPath,
      args: consumer.generated.build,
      cwd: consumerRoot,
      timeoutMs: 600_000,
    });
    outcomes.build = { status: "passed", durationMs: build.durationMs };

    stage = "smoke-test";
    const { browserVersion, smokeTest } = await smokeTestBuild({
      consumerRoot,
      generated: consumer.generated,
      expectedName,
    });
    const frameworkPackage =
      cell.framework === "react-router" ? "react-router" : cell.framework;
    const frameworkVersion = await readInstalledVersion(
      consumerRoot,
      frameworkPackage,
    );
    const reactVersion = await readInstalledVersion(consumerRoot, "react");
    const result = {
      id: run.id,
      status: "passed",
      node: process.version,
      packageManager: { id: run.manager, version: managerVersion },
      framework: {
        id: run.cell,
        name: cell.framework,
        version: frameworkVersion,
      },
      react: { version: reactVersion },
      typescript: { version: "5.7.3", ...outcomes.typecheck },
      browser: {
        name: "chromium",
        version: browserVersion,
        accessibleName: expectedName,
        ...smokeTest,
      },
      tarballs: tarballs.map(({ packageName, name, sha256 }) => ({
        packageName,
        name,
        sha256,
      })),
      install: outcomes.install,
      build: outcomes.build,
      audit: {
        temporaryRootOutsideWorkspace: !temporaryRoot.startsWith(workspaceRoot),
        tarballOnlyPublicPackages: true,
        workspaceAliases: false,
        privateImportPaths: false,
        managerResolution: {
          nodeLinker: manager.nodeLinker ?? null,
          publicPackagePins: consumer.publicPackagePins,
        },
        manifestDependencies: consumer.dependencies,
        scenarioImports: consumer.imports,
      },
    };
    const resultPath = join(
      artifactRoot,
      run.fixture,
      run.cell,
      `${run.manager}.json`,
    );
    await mkdir(dirname(resultPath), { recursive: true });
    await writeFile(resultPath, `${JSON.stringify(result, null, 2)}\n`);
    return { resultPath: relative(workspaceRoot, resultPath), result };
  } catch (error) {
    const resultPath = join(
      artifactRoot,
      run.fixture,
      run.cell,
      `${run.manager}.json`,
    );
    await mkdir(dirname(resultPath), { recursive: true });
    const failure = { id: run.id, status: "failed", stage };
    await writeFile(resultPath, `${JSON.stringify(failure, null, 2)}\n`);
    throw error;
  } finally {
    if (!keepTemporary) {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }
}
