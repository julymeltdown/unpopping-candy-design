import type { CompatibilityManifest } from './types.ts';

type PackageManifest = {
  readonly name: string;
  readonly dependencies?: Readonly<Record<string, string>>;
};

type CatalogCompatibilityErrorCode =
  | 'POPCANDY_VERSION_SET_MIXED'
  | 'POPCANDY_CATALOG_INCOMPATIBLE';

export class CatalogCompatibilityError extends Error {
  override readonly name = 'CatalogCompatibilityError';
  readonly code: CatalogCompatibilityErrorCode;
  readonly installedVersions: Readonly<Record<string, string>>;

  constructor(
    code: CatalogCompatibilityErrorCode,
    installedVersions: Readonly<Record<string, string>>,
  ) {
    super(
      code === 'POPCANDY_VERSION_SET_MIXED'
        ? 'Installed Unpopping Candy packages combine versions from different known releases.'
        : 'Installed Unpopping Candy packages do not match exactly one available catalog.',
    );
    this.code = code;
    this.installedVersions = installedVersions;
  }
}

export function dependencyClosedPackageSets(
  manifests: readonly PackageManifest[],
): readonly (readonly string[])[] {
  const packageNames = [...new Set(manifests.map((manifest) => manifest.name))].sort();
  const publicPackageNames = new Set(packageNames);
  const dependenciesByPackage = new Map(
    manifests.map((manifest) => [
      manifest.name,
      Object.keys(manifest.dependencies ?? {})
        .filter((dependency) => publicPackageNames.has(dependency))
        .sort(),
    ]),
  );
  const sets: string[][] = [];

  for (let mask = 1; mask < 2 ** packageNames.length; mask += 1) {
    const packageSet = packageNames.filter((_, index) => (mask & 2 ** index) !== 0);
    const selectedPackages = new Set(packageSet);
    const isDependencyClosed = packageSet.every((packageName) =>
      (dependenciesByPackage.get(packageName) ?? []).every((dependency) =>
        selectedPackages.has(dependency),
      ),
    );
    if (isDependencyClosed) sets.push(packageSet);
  }

  return sets.sort((left, right) => {
    const leftKey = JSON.stringify(left);
    const rightKey = JSON.stringify(right);
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  });
}

function hasExactPackageSet(
  allowedPackageSets: readonly (readonly string[])[],
  installedNames: readonly string[],
): boolean {
  return allowedPackageSets.some(
    (packageSet) =>
      packageSet.length === installedNames.length &&
      packageSet.every((packageName, index) => packageName === installedNames[index]),
  );
}

function hasExactVersions(
  publicPackageVersions: Readonly<Record<string, string>>,
  installedVersions: Readonly<Record<string, string>>,
  installedNames: readonly string[],
): boolean {
  return installedNames.every(
    (packageName) => publicPackageVersions[packageName] === installedVersions[packageName],
  );
}

export function selectCatalogVersion(
  manifest: CompatibilityManifest,
  installedVersions: Readonly<Record<string, string>>,
): string {
  const installedNames = Object.keys(installedVersions).sort();
  const matches = manifest.releases.filter(
    (release) =>
      hasExactPackageSet(release.allowedPackageSets, installedNames) &&
      hasExactVersions(release.publicPackageVersions, installedVersions, installedNames),
  );

  if (matches.length === 1) {
    const match = matches[0];
    if (match) return match.catalogVersion;
  }

  const nameSetIsKnown = manifest.releases.some((release) =>
    hasExactPackageSet(release.allowedPackageSets, installedNames),
  );
  const everyPackageVersionIsKnown = installedNames.every((packageName) =>
    manifest.releases.some(
      (release) =>
        release.publicPackageVersions[packageName] === installedVersions[packageName],
    ),
  );
  const versionsBelongToOneRelease = manifest.releases.some((release) =>
    hasExactVersions(release.publicPackageVersions, installedVersions, installedNames),
  );

  if (
    installedNames.length > 0 &&
    nameSetIsKnown &&
    everyPackageVersionIsKnown &&
    !versionsBelongToOneRelease
  ) {
    throw new CatalogCompatibilityError('POPCANDY_VERSION_SET_MIXED', installedVersions);
  }

  throw new CatalogCompatibilityError('POPCANDY_CATALOG_INCOMPATIBLE', installedVersions);
}
