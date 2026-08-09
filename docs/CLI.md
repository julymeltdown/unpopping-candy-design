# Commonspace CLI

## Role

`@commonspace/cli` is the deterministic local interface for humans and agents. It answers questions from the installed Commonspace catalog and local project configuration; it does not invoke a model.

During repository development:

```bash
npm run commonspace -- <command> [options]
```

After package publication:

```bash
commonspace <command> [options]
```

Use `--json` in agent workflows so results are not parsed from presentation text.

## Commands

### `info`

Detects the nearest project root and reports:

- package manager;
- framework;
- project package name;
- Commonspace configuration path;
- installed Commonspace package versions;
- source directories;
- required Commonspace style imports already present.

```bash
npm run commonspace -- info --path apps/playground --json
```

### `list`

Lists catalog entries, optionally by kind.

```bash
npm run commonspace -- list --kind component --json
npm run commonspace -- list --kind pattern --json
```

### `search`

Searches names, summaries, keywords, tags, and usage guidance. Results are scored and bounded.

```bash
npm run commonspace -- search "moderation queue" --limit 10 --json
```

### `get`

Returns the exact metadata for a stable ID or known name.

```bash
npm run commonspace -- get ui.dialog --json
npm run commonspace -- get pattern.social-feed --json
```

Unknown entries fail instead of returning an approximate component.

### `compose`

Converts a natural-language interface request into a bounded assembly plan.

```bash
npm run commonspace -- compose \
  "profile settings with loading, error, empty, disabled, and pending states" \
  --json
```

The plan contains:

- the nearest template, when available;
- product patterns;
- component set;
- public imports;
- implementation phases;
- verification steps.

It is a deterministic retrieval and planning operation, not generated application code.

### `validate`

Scans a project for design-system integration failures.

```bash
npm run commonspace -- validate --path apps/playground --json
```

Current checks include:

- private or unknown Commonspace imports;
- source and `dist` deep imports;
- hardcoded visual values that bypass tokens;
- required style setup and project metadata through `doctor`.

Validation output uses stable issue codes, severity, file, line, message, and guidance.

### `doctor`

Reports installation and configuration prerequisites without modifying the project.

```bash
npm run commonspace -- doctor --path . --json
```

### `scaffold`

Plans or applies a Registry template.

Dry-run is mandatory by default:

```bash
npm run commonspace -- scaffold template.profile-settings \
  --path ./consumer-app \
  --target src/profile \
  --json
```

Apply only after reviewing the full plan:

```bash
npm run commonspace -- scaffold template.profile-settings \
  --path ./consumer-app \
  --target src/profile \
  --apply \
  --json
```

The command never overwrites a conflict and never writes outside the selected root.

## Exit and error behavior

- Successful commands return `{ ok: true, command, data }`.
- Failures return `{ ok: false, command, error }` and a non-zero process exit.
- Unknown commands, missing required arguments, unknown catalog IDs, and unsafe scaffold targets fail closed.

## Agent workflow

```text
info
→ search
→ compose
→ get selected entries
→ implement
→ validate
→ Storybook test
```

Do not skip discovery and reconstruct component APIs from memory.
