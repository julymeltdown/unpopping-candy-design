# Compatibility policy

This policy separates a pinned test plan from evidence that was actually executed. A listed cell is not a pass claim unless it appears in the executed evidence section.

## Framework and React matrix

The committed matrix contains exactly seven framework cells:

```text
vite-react-18 | Vite 8.1.0 | React 18.3.1
vite-react-19 | Vite 8.1.0 | React 19.2.8
next-15-react-18 | Next.js 15.5.23 | React 18.3.1
next-15-react-19 | Next.js 15.5.23 | React 19.2.8
next-16-react-19 | Next.js 16.3.0 | React 19.2.8
react-router-7-react-18 | React Router 7.18.2 | React 18.3.1
react-router-7-react-19 | React Router 7.18.2 | React 19.2.8
```

## Package-manager matrix

The committed matrix contains exactly five manager versions:

```text
npm-10 | npm 10.9.9
npm-11 | npm 11.19.0
pnpm-10 | pnpm 10.34.5
pnpm-11 | pnpm 11.21.0
yarn-4 | Yarn 4.18.0 | node-modules
```

The repository source toolchain is pinned separately to exact `pnpm@11.4.0`. That source version builds and packs the workspace; it is not an additional consumer-manager lane.

## Isolation contract

Each executable compatibility run builds all nine public packages in dependency order, packs them into checksum-validated tarballs, creates a fresh operating-system temporary consumer outside the repository, and installs only those tarballs. The runner rejects missing, duplicate, unknown, private, symlinked, escaping, digest-mismatched, or manifest-mismatched artifacts. Installed public package realpaths must remain outside repository source and root `node_modules`.

This tarball-only isolation is the release boundary. A source-linked workspace build does not count as consumer compatibility evidence.

## Planned versus executed

Four fixture scenarios multiplied by seven framework cells and five managers produce 140 planned cells. Plan mode enumerated all 140 planned cells without installing, building, launching a browser, or writing results.

Task 7 documented six executed cells:

```text
base/vite-react-19/pnpm-11
publish-post/vite-react-19/npm-10
activity-review/vite-react-19/yarn-4
member-moderation/vite-react-19/pnpm-11
base/next-15-react-18/pnpm-10
base/react-router-7-react-18/npm-11
```

Those six executed cells passed install, TypeScript `5.7.3` typecheck, production build, and Playwright Chromium smoke checks with their exact expected accessible names. The remaining 134 planned combinations were not executed and are not support claims.

## Reproducing the plan and evidence

```bash
pnpm fixtures:compat -- --all --plan
pnpm fixtures:compat -- --fixture publish-post --all --plan
pnpm fixtures:compat -- --fixture publish-post --cell vite-react-19 --manager npm-10
```

Record the commit SHA, matrix source, Node/manager/framework/React/TypeScript/browser versions, nine tarball names and SHA-256 digests, isolation fields, command stages, and result locator. Failed or unfinished stages must remain explicit rather than being omitted.

## Support boundary

The exact pins are evidence lanes, not open-ended ranges. A new framework, React, manager, or TypeScript version requires a matrix change and a fresh packed-consumer run. See [support](./SUPPORT.md) for the pre-1.0 release window and [versioning](./VERSIONING.md) for coordinated release rules.
