# @commonspace/cli

Deterministic local interface for Commonspace UI knowledge and the guarded template Registry. It detects the current project, searches the exact bundled catalog, proposes composition plans, validates source usage, and scaffolds versioned templates without calling a language model.

```bash
commonspace info --json
commonspace search "profile settings" --json
commonspace get ui.button --json
commonspace compose "social moderation queue" --json
commonspace validate . --json
commonspace doctor --json
commonspace scaffold template.profile-settings --target src/features/profile --var componentPrefix=Account --json
commonspace scaffold template.profile-settings --target src/features/profile --var componentPrefix=Account --apply --json
```

Scaffolding is a dry-run unless `--apply` is present. Existing different files are reported as conflicts and are never overwritten.
