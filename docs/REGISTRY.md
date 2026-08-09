# Unpopping Candy Registry

## Purpose

`@unpopping-candy/registry` distributes complete, reviewable interface compositions without turning private package internals into public APIs.

Registry items are templates, not opaque compiled generators. Every file is represented in a deterministic manifest with role, source, byte length, and SHA-256 digest.

## Current templates

| Stable ID | Target | Purpose |
|---|---|---|
| `template.vite-app-shell` | React + Vite | Theme and package style bootstrap |
| `template.profile-settings` | React + Vite | State-complete settings form |
| `template.social-feed-page` | React + Vite | Feed-page composition using social presentation models |
| `template.moderation-workspace` | React + Vite | Dense moderation decision workspace |
| `template.fsd-social-shell` | React + Vite + FSD | App, page, and widget composition boundaries |

## Manifest

Generated manifests:

```text
packages/registry/src/registry.json
agent/manifests/registry.json
```

Each template contains:

- stable ID and version;
- intended target;
- declared variables;
- file paths and roles;
- source paths;
- individual checksums;
- aggregate checksum.

## Dry-run

Every scaffold begins as a plan.

```bash
npm run popcandy -- scaffold template.social-feed-page \
  --path ../consumer \
  --target src/feed \
  --json
```

The result classifies every target file:

```text
create
unchanged
conflict
```

## Apply

```bash
npm run popcandy -- scaffold template.social-feed-page \
  --path ../consumer \
  --target src/feed \
  --apply \
  --json
```

If any file conflicts, the entire operation fails before writing another file. A second identical apply is idempotent and reports unchanged files.

## Filesystem security

The Registry rejects:

- unknown template IDs;
- undeclared variables;
- absolute targets;
- traversal outside the project root;
- NUL bytes;
- symlink escapes;
- malicious source metadata;
- files outside the bundled template root;
- target conflicts.

It does not download arbitrary Registry code or execute template scripts.

## Authoring a template

1. Define a `TemplateDoc` in the canonical knowledge source.
2. Put source files under `packages/registry/templates/<template>/`.
3. Declare each destination path, role, and source.
4. Use only public Unpopping Candy imports.
5. Include complete loading, empty, error, disabled, and pending states where applicable.
6. Add Registry tests for dry-run, apply, conflict, and idempotency.
7. Run:

```bash
npm run registry:generate
npm run registry:check
npm run popcandy -- scaffold <id> --path <fixture> --json
```

8. Add a Changeset when the template is part of a released package.
