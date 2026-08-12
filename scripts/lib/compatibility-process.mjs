import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { publicPackageFolders } from "./compatibility-contract.mjs";

const outputLimit = 1024 * 1024;

export function runCompatibilityProcess({
  command,
  args,
  cwd,
  timeoutMs = 300_000,
}) {
  const started = performance.now();
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, CI: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    let exceeded = false;
    let timedOut = false;
    let escalation;
    const terminate = () => {
      child.kill("SIGTERM");
      escalation = setTimeout(() => child.kill("SIGKILL"), 2_000);
    };
    const append = (chunk) => {
      output += chunk.toString();
      if (Buffer.byteLength(output) > outputLimit && !exceeded) {
        exceeded = true;
        terminate();
      }
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    const timer = setTimeout(() => {
      timedOut = true;
      terminate();
    }, timeoutMs);
    child.on("error", rejectPromise);
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      clearTimeout(escalation);
      const durationMs = Math.round(performance.now() - started);
      if (code === 0 && !exceeded) {
        resolvePromise({ output: output.trim(), durationMs });
        return;
      }
      const detail = exceeded
        ? "output limit exceeded"
        : timedOut
          ? "timed out"
          : output.slice(-4000);
      rejectPromise(
        new TypeError(
          `${command} failed (${signal ?? code ?? "unknown"}): ${detail}`,
        ),
      );
    });
  });
}

async function sha256(path) {
  const bytes = await readFile(path);
  return createHash("sha256").update(bytes).digest("hex");
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
    const tarballs = [];
    for (const folder of publicPackageFolders) {
      const packageRoot = join(workspaceRoot, "packages", folder);
      const manifest = JSON.parse(
        await readFile(join(packageRoot, "package.json"), "utf8"),
      );
      if (
        manifest.private === true ||
        typeof manifest.name !== "string" ||
        typeof manifest.version !== "string"
      ) {
        throw new TypeError(`Package ${folder} is not a public package.`);
      }
      await runCompatibilityProcess({
        command: "pnpm",
        args: ["--filter", manifest.name, "build"],
        cwd: workspaceRoot,
      });
      const name = `${manifest.name.replace("@", "").replace("/", "-")}-${manifest.version}.tgz`;
      const path = join(outputRoot, name);
      await runCompatibilityProcess({
        command: "pnpm",
        args: ["pack", "--out", path, "--json"],
        cwd: packageRoot,
      });
      tarballs.push({
        packageName: manifest.name,
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
