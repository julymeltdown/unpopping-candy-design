import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  publicPackageFolders,
  publicPackageGraph,
  validatePackedArtifacts,
} from "./compatibility-contract.mjs";
import { createTerminationCoordinator } from "./compatibility-termination.mjs";

export function runCompatibilityProcess({
  command,
  args,
  cwd,
  timeoutMs = 300_000,
  outputLimitBytes = 1024 * 1024,
  killGraceMs = 2_000,
  treeKillTimeoutMs = 5_000,
  terminateTree,
}) {
  const started = performance.now();
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, CI: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
      windowsHide: true,
    });
    const chunks = [];
    let capturedBytes = 0;
    let closed;
    let reason;
    let settled = false;
    let escalation;
    const output = () => Buffer.concat(chunks).toString().trim();
    const cleanup = () => {
      clearTimeout(timer);
      clearTimeout(escalation);
      termination.cleanup();
      child.stdout.removeListener("data", append);
      child.stderr.removeListener("data", append);
      child.removeListener("error", onError);
      child.removeListener("close", onClose);
    };
    const finish = (spawnError) => {
      if (settled) return;
      settled = true;
      cleanup();
      const durationMs = Math.round(performance.now() - started);
      if (!spawnError && !reason && closed?.code === 0) {
        resolvePromise({ output: output(), durationMs });
        return;
      }
      const detail = spawnError?.message ?? reason ?? output().slice(-4000);
      const failure = new TypeError(
        `${command} failed (${closed?.signal ?? closed?.code ?? "unknown"}): ${detail}`,
      );
      failure.output = output();
      rejectPromise(failure);
    };
    const termination = createTerminationCoordinator({
      child,
      timeoutMs: treeKillTimeoutMs,
      onReady: finish,
      terminateTree,
    });
    const beginTermination = (nextReason) => {
      if (reason) return;
      reason = nextReason;
      termination.start();
      escalation = setTimeout(() => {
        termination.force();
      }, killGraceMs);
    };
    const append = (value) => {
      const chunk = Buffer.from(value);
      const remaining = Math.max(0, outputLimitBytes - capturedBytes);
      if (remaining > 0) chunks.push(chunk.subarray(0, remaining));
      capturedBytes += Math.min(remaining, chunk.length);
      if (chunk.length > remaining) beginTermination("output limit exceeded");
    };
    const onError = (error) => finish(error);
    const onClose = (code, signal) => {
      closed = { code, signal };
      if (!reason) finish();
      else {
        clearTimeout(escalation);
        termination.close();
      }
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    child.on("error", onError);
    child.on("close", onClose);
    const timer = setTimeout(() => beginTermination("timed out"), timeoutMs);
  });
}

async function readPublicManifests(workspaceRoot) {
  const manifests = new Map();
  for (const folder of publicPackageFolders) {
    const packageRoot = join(workspaceRoot, "packages", folder);
    const manifest = JSON.parse(
      await readFile(join(packageRoot, "package.json"), "utf8"),
    );
    const dependencies = Object.keys(manifest.dependencies ?? {})
      .filter((name) => name.startsWith("@unpopping-candy/"))
      .map((name) => name.slice("@unpopping-candy/".length))
      .sort();
    if (
      manifest.private === true ||
      manifest.name !== `@unpopping-candy/${folder}` ||
      typeof manifest.version !== "string" ||
      JSON.stringify(dependencies) !==
        JSON.stringify([...publicPackageGraph[folder]].sort())
    ) {
      throw new TypeError(`Package graph mismatch for ${folder}.`);
    }
    manifests.set(folder, { packageRoot, manifest });
  }
  return manifests;
}

function createBuildOrder() {
  const built = new Set();
  const order = [];
  while (order.length < publicPackageFolders.length) {
    const next = publicPackageFolders.find(
      (folder) =>
        !built.has(folder) &&
        publicPackageGraph[folder].every((dependency) => built.has(dependency)),
    );
    if (!next) throw new TypeError("Public package graph contains a cycle.");
    built.add(next);
    order.push(next);
  }
  return order;
}

async function sha256(path) {
  return createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
}

export async function validatePackedWorkspace(packed) {
  return validatePackedArtifacts(packed, async (path, root) => {
    const inspected = await runCompatibilityProcess({
      command: "tar",
      args: ["-xOf", path, "package/package.json"],
      cwd: root,
      timeoutMs: 30_000,
    });
    return JSON.parse(inspected.output);
  });
}

export async function createPackedWorkspace(options) {
  const workspaceRoot = resolve(options.workspaceRoot);
  const ownsOutput = !options.outputRoot;
  const outputRoot = options.outputRoot
    ? resolve(options.outputRoot)
    : await mkdtemp(join(tmpdir(), "popcandy-packs-"));
  await mkdir(outputRoot, { recursive: true });
  try {
    const sourceManager = await runCompatibilityProcess({
      command: "pnpm",
      args: ["--version"],
      cwd: workspaceRoot,
      timeoutMs: 30_000,
    });
    if (sourceManager.output !== "11.4.0") {
      throw new TypeError(
        `Source pnpm must be 11.4.0, received ${sourceManager.output}.`,
      );
    }
    const manifests = await readPublicManifests(workspaceRoot);
    for (const folder of createBuildOrder()) {
      const { manifest } = manifests.get(folder);
      await runCompatibilityProcess({
        command: "pnpm",
        args: ["--filter", manifest.name, "build"],
        cwd: workspaceRoot,
      });
    }
    const tarballs = [];
    for (const folder of publicPackageFolders) {
      const { packageRoot, manifest } = manifests.get(folder);
      const name = `${manifest.name.replace("@", "").replace("/", "-")}-${manifest.version}.tgz`;
      const path = join(outputRoot, name);
      await runCompatibilityProcess({
        command: "pnpm",
        args: ["pack", "--out", path, "--json"],
        cwd: packageRoot,
      });
      tarballs.push({
        packageName: manifest.name,
        version: manifest.version,
        name,
        path,
        sha256: await sha256(path),
      });
    }
    return {
      root: outputRoot,
      sourceManagerVersion: sourceManager.output,
      tarballs,
    };
  } catch (error) {
    if (ownsOutput) await rm(outputRoot, { recursive: true, force: true });
    throw error;
  }
}

export function createManagerInvocation(manager) {
  const prefix = [
    "--yes",
    "--package",
    `${manager.package}@${manager.version}`,
  ];
  const binary =
    manager.package === "@yarnpkg/cli-dist" ? "yarn" : manager.package;
  const installArgs =
    binary === "npm"
      ? ["install", "--ignore-scripts", "--no-audit", "--no-fund"]
      : binary === "pnpm"
        ? ["install", "--ignore-scripts", "--frozen-lockfile=false"]
        : ["install", "--mode=skip-build", "--no-immutable"];
  return {
    command: "npx",
    versionArgs: [...prefix, binary, "--version"],
    installArgs: [...prefix, binary, ...installArgs],
  };
}
