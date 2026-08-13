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

export async function verifyPackedReleaseArtifacts(
  packed,
  requestedVersion,
  options = {},
) {
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
  const versions = [
    ...readme.matchAll(/@unpopping-candy\/mcp@([^\s"'`\],)]+)/g),
  ].map((match) => match[1]);
  if (versions.length !== 1 || versions[0] !== requestedVersion) {
    throw new TypeError(
      "Packed MCP README must advertise the exact candidate version once.",
    );
  }
}
