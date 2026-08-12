import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  publicPackageFolders,
  publicPackageNames,
} from "./compatibility-contract.mjs";
import { stableStringify } from "./release-candidate-contract.mjs";

export async function sha256File(path) {
  return createHash("sha256")
    .update(await readFile(path))
    .digest("hex");
}

export async function createCandidateCompatibility(root, requestedVersion) {
  const manifests = [];
  for (const folder of publicPackageFolders) {
    manifests.push(
      JSON.parse(
        await readFile(join(root, "packages", folder, "package.json"), "utf8"),
      ),
    );
  }
  const catalog = JSON.parse(
    await readFile(join(root, "agent/manifests/catalog.json"), "utf8"),
  );
  const packageNames = manifests.map((manifest) => manifest.name).sort();
  const dependencies = new Map(
    manifests.map((manifest) => [
      manifest.name,
      Object.keys(manifest.dependencies ?? {})
        .filter((name) => packageNames.includes(name))
        .sort(),
    ]),
  );
  const allowedPackageSets = [];
  for (let mask = 1; mask < 2 ** packageNames.length; mask += 1) {
    const selected = packageNames.filter(
      (_, index) => (mask & (2 ** index)) !== 0,
    );
    const selectedNames = new Set(selected);
    if (
      selected.every((name) =>
        dependencies
          .get(name)
          .every((dependency) => selectedNames.has(dependency)),
      )
    ) {
      allowedPackageSets.push(selected);
    }
  }
  allowedPackageSets.sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right)),
  );
  const compatibility = {
    schemaVersion: 1,
    generatedAt: catalog.generatedAt ?? "2026-08-09T00:00:00.000Z",
    releases: [
      {
        catalogVersion: requestedVersion,
        catalogDigest: createHash("sha256")
          .update(stableStringify(catalog))
          .digest("hex"),
        publicPackageVersions: Object.fromEntries(
          manifests
            .map((manifest) => [manifest.name, manifest.version])
            .sort(([left], [right]) => left.localeCompare(right)),
        ),
        allowedPackageSets,
      },
    ],
  };
  const versions = Object.values(
    compatibility.releases[0].publicPackageVersions,
  );
  if (
    versions.length !== publicPackageNames.length ||
    versions.some((version) => version !== requestedVersion)
  ) {
    throw new TypeError("Candidate compatibility versions must be exact.");
  }
  return compatibility;
}

function internalSelectors(manifest) {
  const selectors = [];
  for (const section of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const [name, selector] of Object.entries(manifest[section] ?? {})) {
      if (publicPackageNames.includes(name)) selectors.push({ name, selector });
    }
  }
  return selectors;
}

export async function verifyPackedCandidate(
  packed,
  requestedVersion,
  inspectManifest,
) {
  if (!packed || !Array.isArray(packed.tarballs)) {
    throw new TypeError("Candidate pack result is malformed.");
  }
  const names = packed.tarballs.map((item) => item.packageName);
  if (
    names.length !== publicPackageNames.length ||
    new Set(names).size !== publicPackageNames.length ||
    JSON.stringify([...names].sort()) !==
      JSON.stringify([...publicPackageNames].sort())
  ) {
    throw new TypeError("Candidate must contain exactly nine public packages.");
  }
  const verified = [];
  for (const item of packed.tarballs) {
    const manifest = await inspectManifest(item);
    if (
      manifest.name !== item.packageName ||
      manifest.version !== requestedVersion ||
      manifest.private === true ||
      manifest.repository?.url !==
        "https://github.com/julymeltdown/unpopping-candy-design.git" ||
      manifest.repository?.directory !==
        `packages/${item.packageName.split("/")[1]}` ||
      !/^[0-9a-f]{64}$/.test(item.sha256)
    ) {
      throw new TypeError(`Packed manifest mismatch for ${item.packageName}.`);
    }
    for (const { name, selector } of internalSelectors(manifest)) {
      if (selector !== requestedVersion) {
        throw new TypeError(
          `${manifest.name} dependency ${name} must use a bare exact candidate version.`,
        );
      }
    }
    verified.push({
      packageName: item.packageName,
      version: requestedVersion,
      name: item.name,
      path: item.path,
      sha256: item.sha256,
    });
  }
  return verified.sort((left, right) =>
    left.packageName.localeCompare(right.packageName),
  );
}

export async function inspectTarballManifest(item, cwd, runProcess) {
  const result = await runProcess({
    command: "tar",
    args: ["-xOf", item.path, "package/package.json"],
    cwd,
    timeoutMs: 30_000,
  });
  return JSON.parse(result.output);
}

export async function packageEvidence(packages, packagesRoot) {
  return Promise.all(
    packages.map(async (item) => ({
      name: item.packageName,
      version: item.version,
      path: `packages/${item.name}`,
      sha256: await sha256File(join(packagesRoot, item.name)),
    })),
  );
}
