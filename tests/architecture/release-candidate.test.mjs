import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  createCandidateCompatibility,
  rewriteCandidateManifests,
  sourceHashes,
  validateCandidateRequest,
  verifyPackedCandidate,
} from "../../scripts/prepare-release-candidate.mjs";
import {
  publicPackageFolders,
  publicPackageNames,
} from "../../scripts/lib/compatibility-contract.mjs";

async function writeFixture() {
  const root = await mkdtemp(join(tmpdir(), "popcandy-candidate-test-"));
  await mkdir(join(root, ".changeset"));
  await mkdir(join(root, "agent/manifests"), { recursive: true });
  await mkdir(join(root, "packages/knowledge/src/generated"), {
    recursive: true,
  });
  for (const folder of [...publicPackageFolders, "evals", "figma"]) {
    await mkdir(join(root, "packages", folder), { recursive: true });
    const dependencies =
      folder === "cli"
        ? { "@unpopping-candy/knowledge": "workspace:^" }
        : folder === "evals" || folder === "figma"
          ? { "@unpopping-candy/knowledge": "workspace:^" }
          : {};
    await writeFile(
      join(root, "packages", folder, "package.json"),
      `${JSON.stringify(
        {
          name: `@unpopping-candy/${folder}`,
          version: folder === "evals" || folder === "figma" ? "0.2.0" : "0.3.0",
          ...(folder === "evals" || folder === "figma"
            ? { private: true }
            : {}),
          dependencies,
        },
        null,
        2,
      )}\n`,
    );
  }
  await writeFile(join(root, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  await writeFile(join(root, ".changeset/release.md"), "---\n---\n");
  await writeFile(
    join(root, "agent/manifests/catalog.json"),
    '{"entries":[]}\n',
  );
  await writeFile(join(root, "agent/manifests/compatibility.json"), "{}\n");
  await writeFile(
    join(root, "packages/knowledge/src/generated/compatibility.ts"),
    "export const compatibility = {};\n",
  );
  return root;
}

test("candidate request enforces prerelease channel and output boundaries", async () => {
  const root = await writeFixture();
  assert.deepEqual(
    validateCandidateRequest({
      workspaceRoot: root,
      version: "0.3.0-alpha.0",
      channel: "next",
      out: join(root, ".artifacts/releases/candidate-output"),
    }),
    {
      workspaceRoot: root,
      requestedVersion: "0.3.0-alpha.0",
      channel: "next",
      outputRoot: join(root, ".artifacts/releases/candidate-output"),
    },
  );
  assert.throws(
    () =>
      validateCandidateRequest({
        workspaceRoot: root,
        version: "0.3.0-alpha.0",
        channel: "latest",
        out: join(root, ".artifacts/releases/candidate-output"),
      }),
    /prerelease candidates require channel next/,
  );
  assert.throws(
    () =>
      validateCandidateRequest({
        workspaceRoot: root,
        version: "0.3.0",
        channel: "next",
        out: join(root, ".artifacts/releases/candidate-output"),
      }),
    /channel next requires a prerelease/,
  );
  assert.throws(
    () =>
      validateCandidateRequest({
        workspaceRoot: root,
        version: "0.3.0-alpha.0",
        channel: "next",
        out: join(root, "packages/release"),
      }),
    /direct child of \.artifacts\/releases/,
  );
  for (const version of ["01.2.3-alpha.0", "0.3.0-01", "0.3.0-alpha..0"]) {
    assert.throws(
      () =>
        validateCandidateRequest({
          workspaceRoot: root,
          version,
          channel: "next",
          out: join(root, ".artifacts/releases/candidate-output"),
        }),
      /exact SemVer/,
      version,
    );
  }
});

test("one rewrite path drives alpha and beta staging manifests", async () => {
  for (const requestedVersion of ["0.3.0-alpha.0", "0.3.0-beta.0"]) {
    const root = await writeFixture();
    const before = await sourceHashes(root);
    const rewritten = await rewriteCandidateManifests(root, requestedVersion);
    assert.deepEqual(
      rewritten.publicPackageNames,
      [...publicPackageNames].sort(),
    );
    for (const folder of publicPackageFolders) {
      const manifest = JSON.parse(
        await readFile(join(root, "packages", folder, "package.json"), "utf8"),
      );
      assert.equal(manifest.version, requestedVersion);
      for (const [name, selector] of Object.entries(
        manifest.dependencies ?? {},
      )) {
        if (publicPackageNames.includes(name)) {
          assert.equal(selector, `workspace:${requestedVersion}`);
        }
      }
    }
    for (const folder of ["evals", "figma"]) {
      const manifest = JSON.parse(
        await readFile(join(root, "packages", folder, "package.json"), "utf8"),
      );
      assert.equal(manifest.version, "0.2.0");
      assert.equal(
        manifest.dependencies["@unpopping-candy/knowledge"],
        `workspace:${requestedVersion}`,
      );
    }
    assert.notDeepEqual(await sourceHashes(root), before);
  }
});

test("candidate compatibility record selects the exact requested version", async () => {
  const root = await writeFixture();
  await rewriteCandidateManifests(root, "0.3.0-beta.0");
  const compatibility = await createCandidateCompatibility(
    root,
    "0.3.0-beta.0",
  );
  assert.equal(compatibility.releases.length, 1);
  assert.equal(compatibility.releases[0].catalogVersion, "0.3.0-beta.0");
  assert.deepEqual(
    new Set(Object.values(compatibility.releases[0].publicPackageVersions)),
    new Set(["0.3.0-beta.0"]),
  );
});

test("packed candidates contain exactly nine bare exact internal ranges", async () => {
  const root = await mkdtemp(join(tmpdir(), "popcandy-packed-candidate-test-"));
  const tarballs = [];
  for (const [index, packageName] of publicPackageNames.entries()) {
    const manifest = {
      name: packageName,
      version: "0.3.0-alpha.0",
      repository: {
        url: "https://github.com/julymeltdown/unpopping-candy-design.git",
        directory: `packages/${packageName.split("/")[1]}`,
      },
      dependencies:
        index === 0 ? {} : { [publicPackageNames[0]]: "0.3.0-alpha.0" },
    };
    tarballs.push({
      packageName,
      version: manifest.version,
      name: `${packageName.slice(1).replace("/", "-")}-${manifest.version}.tgz`,
      path: join(root, `${index}.tgz`),
      sha256: "a".repeat(64),
      manifest,
    });
  }
  assert.equal(
    (
      await verifyPackedCandidate(
        { root, tarballs },
        "0.3.0-alpha.0",
        (item) => item.manifest,
      )
    ).length,
    9,
  );
  tarballs[1].manifest.dependencies[publicPackageNames[0]] = "workspace:^";
  await assert.rejects(
    () =>
      verifyPackedCandidate(
        { root, tarballs },
        "0.3.0-alpha.0",
        (item) => item.manifest,
      ),
    /bare exact/,
  );
});

test("candidate implementation reuses the canonical compatibility engines", async () => {
  const source = await readFile(
    new URL("../../scripts/prepare-release-candidate.mjs", import.meta.url),
    "utf8",
  );
  assert.match(
    source,
    /import \{[\s\S]*packPublicWorkspace[\s\S]*runCompatibilityMatrix[\s\S]*\} from "\.\/run-compatibility-matrix\.mjs"/,
  );
  assert.doesNotMatch(source, /\["pack"/);
  assert.doesNotMatch(source, /0\.3\.0-(?:alpha|beta)/);
});

test("candidate subprocesses receive a bounded non-secret environment", async () => {
  const source = await readFile(
    new URL("../../scripts/prepare-release-candidate.mjs", import.meta.url),
    "utf8",
  );
  assert.match(source, /environment: candidateEnvironment\(\)/);
  assert.match(
    source,
    /TOKEN\|SECRET\|PASSWORD\|CREDENTIAL\|AUTH\|COOKIE\|KEY/,
  );
  assert.doesNotMatch(source, /environment:\s*process\.env/);
  assert.match(source, /assertTrackedSourceClean/);
});

test("candidate copy enumerates tracked files and preserves worktree identity only", async () => {
  const source = await readFile(
    new URL(
      "../../scripts/lib/release-candidate-workspace.mjs",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /\["ls-files", "-z"\]/);
  assert.match(source, /join\(sourceRoot, "\.git"\)/);
  assert.doesNotMatch(source, /for \(const name of await readdir\(source\)\)/);
});
