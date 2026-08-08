# Publishing

## Preconditions

External publication is blocked until all of the following are true:

1. the repository owner selects an explicit license;
2. `pnpm install` succeeds from the intended registry;
3. a reviewed `pnpm-lock.yaml` is committed;
4. full typecheck, package builds, consumer build, and Storybook build pass;
5. browser interaction and accessibility tests pass;
6. npm organization and provenance settings are configured;
7. `NPM_TOKEN` is available to the release workflow if required by the registry.

## Changeset workflow

Record every public change:

```bash
pnpm changeset
```

Choose affected packages and bump level:

```text
patch  bug fix with compatible API
minor  compatible component/token/feature addition
major  breaking API, token, export, or behavior change
```

Commit the generated Markdown file with the implementation.

## Version pull request

The release workflow uses Changesets Action on `master` to maintain a version pull request. The version PR:

- applies package versions;
- converts queued changesets into changelogs;
- updates internal package ranges;
- removes consumed changeset files.

## Publish

After the version PR is merged, the action runs:

```bash
pnpm release
```

The command builds publishable packages before publication.

## Release channels

Recommended future channels:

```text
latest   stable releases
next     release candidates and next-major work
canary   commit-scoped integration testing
```

Do not publish canary packages from unverified source aliases. Build and test the actual package tarballs.

## Package inspection

Before first publication, add a tarball inspection step:

```bash
pnpm --filter @commonspace/ui pack
```

Verify:

- only `dist`, README, package manifest, and permitted notices ship;
- source, tests, Storybook, and application fixtures are excluded;
- every export exists in the tarball;
- CSS assets and declaration maps resolve;
- no secrets or local paths are present.

## Compatibility policy

Breaking changes include:

- removal or rename of an export;
- required prop additions;
- token removal or semantic redefinition;
- changed controlled-state semantics;
- changed accessibility behavior that requires consumer action;
- changed required CSS import order;
- presentation model field removal or incompatible type change.

Internal file moves are not breaking when all public exports and behavior remain stable.
