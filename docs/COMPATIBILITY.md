# Compatibility policy

This policy separates a pinned test plan from evidence that was actually executed. A listed cell is not a pass claim unless it appears in the executed evidence section.

## Framework and React matrix

The committed matrix contains exactly seven framework cells:

| Cell ID                 | Framework    | Version | React  |
| ----------------------- | ------------ | ------- | ------ |
| vite-react-18           | Vite         | 8.1.0   | 18.3.1 |
| vite-react-19           | Vite         | 8.1.0   | 19.2.8 |
| next-15-react-18        | Next.js      | 15.5.23 | 18.3.1 |
| next-15-react-19        | Next.js      | 15.5.23 | 19.2.8 |
| next-16-react-19        | Next.js      | 16.3.0  | 19.2.8 |
| react-router-7-react-18 | React Router | 7.18.2  | 18.3.1 |
| react-router-7-react-19 | React Router | 7.18.2  | 19.2.8 |

## Package-manager matrix

The committed matrix contains exactly five manager versions:

| Manager ID | Package           | Version | Linker       |
| ---------- | ----------------- | ------- | ------------ |
| npm-10     | npm               | 10.9.9  | default      |
| npm-11     | npm               | 11.19.0 | default      |
| pnpm-10    | pnpm              | 10.34.5 | default      |
| pnpm-11    | pnpm              | 11.21.0 | default      |
| yarn-4     | @yarnpkg/cli-dist | 4.18.0  | node-modules |

The repository source toolchain is pinned separately to exact `pnpm@11.4.0`. That source version builds and packs the workspace; it is not an additional consumer-manager lane.

## Isolation contract

Each executable compatibility run builds all nine public packages in dependency order, packs them into checksum-validated tarballs, creates a fresh operating-system temporary consumer outside the repository, and installs only those tarballs. The runner rejects missing, duplicate, unknown, private, symlinked, escaping, digest-mismatched, or manifest-mismatched artifacts. Installed public package realpaths must remain outside repository source and root `node_modules`.

This tarball-only isolation is the release boundary. A source-linked workspace build does not count as consumer compatibility evidence.

## Planned versus executed

Four fixture scenarios multiplied by seven framework cells and five managers produce 140 planned cells. Plan mode enumerated all 140 planned cells without installing, building, launching a browser, or writing results.

Task 7 documented exactly six executed cells:

| Executed ID                             | Status |
| --------------------------------------- | ------ |
| base/vite-react-19/pnpm-11              | passed |
| publish-post/vite-react-19/npm-10       | passed |
| activity-review/vite-react-19/yarn-4    | passed |
| member-moderation/vite-react-19/pnpm-11 | passed |
| base/next-15-react-18/pnpm-10           | passed |
| base/react-router-7-react-18/npm-11     | passed |

The tracked [sanitized compatibility summary](./evidence/stage-0-compatibility-summary.json) records schema version `2`, its full source commit, runner, per-run Node/framework/React/TypeScript/browser versions, nine tarball names and SHA-256 digests, install/typecheck/build/smoke statuses, isolation booleans, and exact expected accessible name. Those six executed cells passed all four recorded stages. The original result locators belong to ignored local artifacts, are unavailable in the tracked summary, and are not claimed as retained evidence. The remaining 134 planned combinations were not executed and are not support claims.

## Reproducing the plan and evidence

```bash
pnpm fixtures:compat -- --all --plan
pnpm fixtures:compat -- --fixture publish-post --all --plan
pnpm fixtures:compat -- --fixture publish-post --cell vite-react-19 --manager npm-10
```

Record the commit SHA, matrix source, Node/manager/framework/React/TypeScript/browser versions, nine tarball names and SHA-256 digests, isolation fields, command stages, and result locator. Failed or unfinished stages must remain explicit rather than being omitted.

## Support boundary

The exact pins are evidence lanes, not open-ended ranges. A new framework, React, manager, or TypeScript version requires a matrix change and a fresh packed-consumer run. See [support](./SUPPORT.md) for the pre-1.0 release window and [versioning](./VERSIONING.md) for coordinated release rules.
