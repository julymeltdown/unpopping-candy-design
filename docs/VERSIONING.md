# Versioning policy

## Module and package format

Public packages are ESM-only (`"type": "module"`) and expose documented root or subpath exports. Imports from `src`, `dist` internals, or repository-relative package paths are unsupported. Removing or changing an export, prop contract, stable catalog ID, semantic token, Registry schema, or machine-readable interface can be breaking even when rendered output looks similar.

## Pre-1.0 changes

During `0.N.x`, a minor version may contain breaking changes. Patch releases correct defects without intentionally breaking documented public contracts. Consumers should read Changesets, migration notes, compatibility evidence, and package manifests before moving to a new minor.

Deprecation is preferred before withdrawal when a safe transition exists. A deprecation identifies the replacement and migration path in metadata and release notes. Before `1.0`, withdrawal may occur in the next minor; urgent security or correctness removals may happen sooner and must be called out explicitly.

## Coordinated releases

Release candidates and future publications use coordinated public package versions: all nine public packages receive the same requested release version, internal ranges are rewritten consistently for packed artifacts, and compatibility metadata records that exact set. The current Stage 0 source manifests still contain `0.1.0` and `0.2.0`; they are not evidence of a coordinated npm publication.

The two private tooling packages are not publication targets. Generated documents are derived artifacts and are changed through canonical source plus generation, never versioned independently by hand.

## Prerelease channels

Prerelease versions use explicit SemVer identifiers such as `alpha` or `beta` and publish, when authorized, to a non-default channel such as npm tag `next`. Prerelease APIs may change between captures. A prerelease candidate, local tarball, plan, or dry run is not a stable release and does not imply npm availability.

## Compatibility and support

Before `1.0`, once publication begins, only the newest published current minor is supported. No published minor exists today, so the Stage 0 source versions and local candidates have no supported npm-release window. Every release claim names exact framework, React, package-manager, TypeScript, browser, and assistive-technology evidence rather than inheriting unexecuted plans. See [compatibility](./COMPATIBILITY.md), [accessibility](./ACCESSIBILITY.md), and [support](./SUPPORT.md).

## External authorization

Version calculation, local builds, packing, validation, and dry-run candidate preparation may be automated locally. npm publication, tag changes, releases, workflow dispatch, Pages or hosted-service deployment, Figma publication, remote Registry writes, and model/provider calls are external actions and require explicit owner authorization for that action and target. Request authorization in a repository issue or pull request that names the exact action and target; a repository owner records approval there before execution. Security-sensitive requests use private vulnerability reporting.

Authorization is not inferred from a green build, credential availability, a configured workflow, or an earlier approval for a different action. Release evidence must distinguish preparation from execution and must not claim a remote outcome that was not observed.
