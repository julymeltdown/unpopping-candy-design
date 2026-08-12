import assert from "node:assert/strict";
import test from "node:test";
import {
  CatalogCompatibilityError,
  dependencyClosedPackageSets,
  selectCatalogVersion,
} from "../src/compatibility.ts";
import {
  bundledCatalog,
  bundledCompatibilityManifest,
  selectCatalogVersion as selectCatalogVersionFromIndex,
} from "../src/index.ts";
import type { CompatibilityManifest } from "../src/types.ts";

const packageManifests = [
  { name: "@unpopping-candy/tokens" },
  {
    name: "@unpopping-candy/theme",
    dependencies: { "@unpopping-candy/tokens": "workspace:^" },
  },
  {
    name: "@unpopping-candy/icons",
    dependencies: { "@ant-design/icons": "6.3.2" },
  },
  {
    name: "@unpopping-candy/ui",
    dependencies: {
      "@unpopping-candy/icons": "workspace:^",
      "@unpopping-candy/tokens": "workspace:^",
    },
  },
  {
    name: "@unpopping-candy/social",
    dependencies: {
      "@unpopping-candy/icons": "workspace:^",
      "@unpopping-candy/tokens": "workspace:^",
      "@unpopping-candy/ui": "workspace:^",
    },
  },
  { name: "@unpopping-candy/knowledge" },
  {
    name: "@unpopping-candy/registry",
    dependencies: { "@unpopping-candy/knowledge": "workspace:^" },
  },
  {
    name: "@unpopping-candy/cli",
    dependencies: {
      "@unpopping-candy/knowledge": "workspace:^",
      "@unpopping-candy/registry": "workspace:^",
    },
  },
  {
    name: "@unpopping-candy/mcp",
    dependencies: {
      "@modelcontextprotocol/server": "2.0.0",
      "@unpopping-candy/cli": "workspace:^",
      "@unpopping-candy/knowledge": "workspace:^",
      "@unpopping-candy/registry": "workspace:^",
      "@unpopping-candy/tokens": "workspace:^",
      zod: "4.4.3",
    },
  },
] as const;

const allowedPackageSets = [
  ["@unpopping-candy/knowledge"],
  ["@unpopping-candy/tokens"],
  ["@unpopping-candy/tokens", "@unpopping-candy/ui"],
] as const;

const manifest = {
  schemaVersion: 1,
  generatedAt: "2026-08-09T00:00:00.000Z",
  releases: [
    {
      catalogVersion: "0.2.0",
      catalogDigest: "2".repeat(64),
      publicPackageVersions: {
        "@unpopping-candy/knowledge": "0.2.0",
        "@unpopping-candy/tokens": "0.2.0",
        "@unpopping-candy/ui": "0.2.0",
      },
      allowedPackageSets,
    },
    {
      catalogVersion: "0.3.0-alpha.0",
      catalogDigest: "3".repeat(64),
      publicPackageVersions: {
        "@unpopping-candy/knowledge": "0.3.0-alpha.0",
        "@unpopping-candy/tokens": "0.3.0-alpha.0",
        "@unpopping-candy/ui": "0.3.0-alpha.0",
      },
      allowedPackageSets,
    },
  ],
} satisfies CompatibilityManifest;

function hasCode(
  error: unknown,
  code: CatalogCompatibilityError["code"],
): boolean {
  return error instanceof CatalogCompatibilityError && error.code === code;
}

test("dependency closure returns deterministic sorted non-empty public package sets", () => {
  // Given: the public manifests in canonical and reverse order.
  const reversedManifests = [...packageManifests].reverse();

  // When: every dependency-closed package set is enumerated.
  const sets = dependencyClosedPackageSets(packageManifests);

  // Then: input order does not affect the sorted, non-empty result.
  assert.deepEqual(sets, dependencyClosedPackageSets(reversedManifests));
  assert.ok(sets.every((set) => set.length > 0));
  assert.ok(sets.every((set) => set.join("\n") === [...set].sort().join("\n")));
});

test("dependency closure retains supported visual and tooling package sets", () => {
  // Given: the complete public package dependency graph.
  const sets = dependencyClosedPackageSets(packageManifests);

  // When: the sets are serialized for exact membership checks.
  const serializedSets = new Set(sets.map((set) => JSON.stringify(set)));

  // Then: dependency-complete visual and tooling combinations are supported.
  assert.ok(
    serializedSets.has(
      JSON.stringify([
        "@unpopping-candy/icons",
        "@unpopping-candy/theme",
        "@unpopping-candy/tokens",
        "@unpopping-candy/ui",
      ]),
    ),
  );
  assert.ok(
    serializedSets.has(
      JSON.stringify([
        "@unpopping-candy/cli",
        "@unpopping-candy/icons",
        "@unpopping-candy/knowledge",
        "@unpopping-candy/mcp",
        "@unpopping-candy/registry",
        "@unpopping-candy/tokens",
        "@unpopping-candy/ui",
      ]),
    ),
  );
});

test("catalog selection returns the exact stable package-set mapping", () => {
  // Given: installed versions matching one stable release and allowed set.
  const installedVersions = {
    "@unpopping-candy/tokens": "0.2.0",
    "@unpopping-candy/ui": "0.2.0",
  };

  // When: the compatible catalog is selected.
  const version = selectCatalogVersion(manifest, installedVersions);

  // Then: the stable catalog version is returned.
  assert.equal(version, "0.2.0");
});

test("catalog selection requires an explicit prerelease package-set mapping", () => {
  // Given: installed versions matching the explicitly recorded prerelease.
  const installedVersions = {
    "@unpopping-candy/ui": "0.3.0-alpha.0",
    "@unpopping-candy/tokens": "0.3.0-alpha.0",
  };

  // When: the compatible catalog is selected.
  const version = selectCatalogVersion(manifest, installedVersions);

  // Then: the prerelease catalog version is returned exactly.
  assert.equal(version, "0.3.0-alpha.0");
});

test("catalog selection rejects a mix of known release versions", () => {
  // Given: an allowed name set whose versions come from different releases.
  const installedVersions = {
    "@unpopping-candy/ui": "0.3.0-alpha.0",
    "@unpopping-candy/tokens": "0.2.0",
  };

  // When: selection is attempted.
  const select = () => selectCatalogVersion(manifest, installedVersions);

  // Then: the stable mixed-version code is emitted.
  assert.throws(select, (error) =>
    hasCode(error, "POPCANDY_VERSION_SET_MIXED"),
  );
});

test("catalog selection rejects a package-name set absent from the manifest", () => {
  // Given: a known package version in a dependency-incomplete name set.
  const installedVersions = { "@unpopping-candy/ui": "0.3.0-alpha.0" };

  // When: selection is attempted.
  const select = () => selectCatalogVersion(manifest, installedVersions);

  // Then: selection fails closed as incompatible.
  assert.throws(select, (error) =>
    hasCode(error, "POPCANDY_CATALOG_INCOMPATIBLE"),
  );
});

test("catalog selection rejects ambiguous exact mappings", () => {
  // Given: two catalog releases matching the same exact names and versions.
  const ambiguousManifest = {
    ...manifest,
    releases: [
      ...manifest.releases,
      {
        catalogVersion: "0.3.0-alpha.0-duplicate",
        catalogDigest: "4".repeat(64),
        publicPackageVersions: {
          "@unpopping-candy/knowledge": "0.3.0-alpha.0",
          "@unpopping-candy/tokens": "0.3.0-alpha.0",
          "@unpopping-candy/ui": "0.3.0-alpha.0",
        },
        allowedPackageSets,
      },
    ],
  } satisfies CompatibilityManifest;
  const installedVersions = {
    "@unpopping-candy/tokens": "0.3.0-alpha.0",
    "@unpopping-candy/ui": "0.3.0-alpha.0",
  };

  // When: selection is attempted.
  const select = () =>
    selectCatalogVersion(ambiguousManifest, installedVersions);

  // Then: selection fails closed as incompatible.
  assert.throws(select, (error) =>
    hasCode(error, "POPCANDY_CATALOG_INCOMPATIBLE"),
  );
});

test("package index exposes the bundled compatibility selector contract", () => {
  // Given: the installed knowledge package recorded by the bundled manifest.
  const installedVersions = {
    "@unpopping-candy/knowledge": bundledCatalog.packageVersion,
  };

  // When: selection runs entirely through public package exports.
  const version = selectCatalogVersionFromIndex(
    bundledCompatibilityManifest,
    installedVersions,
  );

  // Then: the selected catalog is the bundled catalog payload.
  assert.equal(version, bundledCatalog.packageVersion);
});
