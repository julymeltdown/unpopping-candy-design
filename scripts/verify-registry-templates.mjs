import { spawn } from "node:child_process";
import {
  access,
  constants,
  cp,
  mkdtemp,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { repositoryRoot } from "./lib/project-inspection.mjs";
const outputLimit = 1024 * 1024;

function runTypeScript(command, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    let timer;
    const child = spawn(command, ["--noEmit", "-p", "tsconfig.json"], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    const chunks = [];
    let bytes = 0;
    let reason;
    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const output = Buffer.concat(chunks).toString().trim();
      if (!error && !reason) resolvePromise();
      else rejectPromise(new TypeError(reason ?? error?.message ?? output));
    };
    const append = (value) => {
      const chunk = Buffer.from(value);
      const remaining = Math.max(0, outputLimit - bytes);
      if (remaining) chunks.push(chunk.subarray(0, remaining));
      bytes += chunk.length;
      if (chunk.length > remaining && !reason) {
        reason = "Registry template typecheck exceeded its output limit.";
        child.kill("SIGKILL");
      }
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    child.once("error", (error) => {
      reason = error.message;
      finish(error);
    });
    child.once("close", (code, signal) => {
      if (code !== 0 && !reason)
        reason = `Registry template typecheck failed (${signal ?? code}): ${Buffer.concat(chunks).toString().trim()}`;
      finish();
    });
    timer = setTimeout(() => {
      reason = "Registry template typecheck timed out.";
      child.kill("SIGKILL");
    }, 30_000);
  });
}

export async function verifyRegistryTemplates(root = repositoryRoot()) {
  const typeScript = join(root, "node_modules/.bin/tsc");
  const consumerModules = join(root, "apps/consumer-fixture/node_modules");
  await Promise.all([
    access(typeScript, constants.X_OK),
    access(consumerModules, constants.R_OK),
  ]);
  const temporaryRoot = await mkdtemp(join(tmpdir(), "popcandy-templates-"));
  try {
    await cp(
      join(root, "packages/registry/templates"),
      join(temporaryRoot, "src"),
      {
        recursive: true,
      },
    );
    await symlink(
      consumerModules,
      join(temporaryRoot, "node_modules"),
      "junction",
    );
    const paths = Object.fromEntries(
      ["ui", "social", "theme", "tokens", "icons"].map((name) => [
        `@unpopping-candy/${name}`,
        [join(root, `packages/${name}/src/index.ts`)],
      ]),
    );
    const config = {
      extends: join(root, "tsconfig.base.json"),
      compilerOptions: {
        noEmit: true,
        types: ["vite/client"],
        paths,
      },
      include: ["src/**/*.ts", "src/**/*.tsx"],
    };
    await writeFile(
      join(temporaryRoot, "tsconfig.json"),
      `${JSON.stringify(config, null, 2)}\n`,
    );
    await runTypeScript(typeScript, temporaryRoot);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await verifyRegistryTemplates();
  console.log("Registry templates typechecked against public source exports.");
}
