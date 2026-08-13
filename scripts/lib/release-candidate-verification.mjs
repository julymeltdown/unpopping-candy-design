import {
  inspectTarballManifest,
  verifyPackedCandidate,
} from "./release-candidate-artifacts.mjs";
import { runCompatibilityProcess } from "./compatibility-process.mjs";

async function inspectTarballFile(item, entry, cwd) {
  const result = await runCompatibilityProcess({
    command: "tar",
    args: ["-xOf", item.path, entry],
    cwd,
    timeoutMs: 30_000,
  });
  return result.output;
}

async function inspectTarballArchive(item, cwd) {
  const [namesResult, verboseResult] = await Promise.all(
    [
      ["-tzf", item.path],
      ["-tvzf", item.path],
    ].map((args) =>
      runCompatibilityProcess({
        command: "tar",
        args,
        cwd,
        timeoutMs: 30_000,
        outputLimitBytes: 1024 * 1024,
      }),
    ),
  );
  const names = namesResult.output.split("\n").filter(Boolean);
  const verbose = verboseResult.output.split("\n").filter(Boolean);
  if (names.length === 0 || names.length !== verbose.length) {
    throw new TypeError(`${item.packageName}: archive listing is malformed.`);
  }
  return names.map((name, index) => ({
    name,
    type: verbose[index].slice(0, 1),
  }));
}

function archiveMemberPath(entry) {
  const path = entry.name.endsWith("/") ? entry.name.slice(0, -1) : entry.name;
  const segments = path.split("/");
  if (
    path.length === 0 ||
    path.length > 512 ||
    path.startsWith("/") ||
    path.includes("\\") ||
    !path.startsWith("package") ||
    segments.some(
      (segment) =>
        segment.length === 0 ||
        segment === "." ||
        segment === ".." ||
        segment.startsWith("."),
    )
  ) {
    throw new TypeError(`unsafe archive member: ${entry.name}`);
  }
  return { path, segments };
}

export function verifyCandidateArchive(item, entries) {
  if (
    !Array.isArray(entries) ||
    entries.length === 0 ||
    entries.length > 4096
  ) {
    throw new TypeError(`${item.packageName}: archive listing is malformed.`);
  }
  const names = new Set();
  const critical = new Set([
    "package/package.json",
    "package/README.md",
    "package/LICENSE.md",
  ]);
  let hasDistribution = false;
  for (const entry of entries) {
    if (entry?.type !== "-" && entry?.type !== "d") {
      throw new TypeError(
        `${item.packageName}: archive may contain only regular files and directories.`,
      );
    }
    const { path, segments } = archiveMemberPath(entry);
    if (names.has(path)) {
      throw new TypeError(
        `${item.packageName}: duplicate archive member ${path}.`,
      );
    }
    names.add(path);
    if (segments[0] !== "package") {
      throw new TypeError(`unsafe archive member: ${entry.name}`);
    }
    if (segments.length === 1) {
      if (entry.type !== "d") {
        throw new TypeError(
          `${item.packageName}: forbidden archive member ${path}.`,
        );
      }
      continue;
    }
    if (critical.has(path)) {
      if (entry.type !== "-") {
        throw new TypeError(
          `${item.packageName}: forbidden archive member ${path}.`,
        );
      }
      continue;
    }
    const allowedRoot =
      segments[1] === "dist" ||
      (item.packageName === "@unpopping-candy/registry" &&
        segments[1] === "templates");
    const sensitive =
      segments.includes("node_modules") ||
      /\.(?:key|pem|p12|pfx)$/i.test(path) ||
      segments.some((segment) => segment.startsWith("."));
    if (
      !allowedRoot ||
      sensitive ||
      (segments.length === 2 && entry.type !== "d")
    ) {
      throw new TypeError(
        `${item.packageName}: forbidden archive member ${path}.`,
      );
    }
    if (segments[1] === "dist" && segments.length > 2 && entry.type === "-") {
      hasDistribution = true;
    }
  }
  if ([...critical].some((path) => !names.has(path)) || !hasDistribution) {
    throw new TypeError(
      `${item.packageName}: archive contents are incomplete.`,
    );
  }
}

function verifyMcpReadme(readme, requestedVersion) {
  const withoutHeading = readme
    .split("\n")
    .filter((line) => line.trim() !== "# @unpopping-candy/mcp")
    .join("\n");
  const versions = [
    ...withoutHeading.matchAll(
      /@unpopping-candy\/mcp(?:@([0-9A-Za-z][0-9A-Za-z.+-]*))?(?=[\s"'`\],)]|$)/g,
    ),
  ].map((match) => match[1]);
  if (versions.length !== 1 || versions[0] !== requestedVersion) {
    throw new TypeError(
      "Packed MCP README must advertise the exact candidate version once.",
    );
  }
}

export async function verifyPackedReleaseArtifacts(
  packed,
  requestedVersion,
  options = {},
) {
  if (!packed || !Array.isArray(packed.tarballs)) {
    throw new TypeError("Candidate pack result is malformed.");
  }
  const inspectArchive =
    options.inspectArchive ??
    ((item) => inspectTarballArchive(item, packed.root));
  for (const item of packed.tarballs) {
    verifyCandidateArchive(item, await inspectArchive(item));
  }
  await verifyPackedCandidate(
    packed,
    requestedVersion,
    options.inspectManifest ??
      ((item) =>
        inspectTarballManifest(item, packed.root, runCompatibilityProcess)),
  );
  const mcpPackage = packed.tarballs.find(
    ({ packageName }) => packageName === "@unpopping-candy/mcp",
  );
  const readme = await (
    options.inspectMcpReadme ??
    ((item) => inspectTarballFile(item, "package/README.md", packed.root))
  )(mcpPackage);
  verifyMcpReadme(readme, requestedVersion);
}
