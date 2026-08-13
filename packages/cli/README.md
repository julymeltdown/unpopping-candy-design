# @unpopping-candy/cli

Deterministic local interface for Unpopping Candy knowledge and the guarded template Registry. It detects the current project, searches the exact bundled catalog, proposes composition plans, validates source usage, and scaffolds versioned templates without calling a language model.

Requires Node `>=22.13.0 <23 || >=24 <25`.

```bash
popcandy info --json
popcandy search "profile settings" --json
popcandy get ui.button --json
popcandy compose "social moderation queue" --json
popcandy validate --path . --json
popcandy doctor --json
popcandy scaffold template.profile-settings --target src/features/profile --var componentPrefix=Account --json
popcandy scaffold template.profile-settings --target src/features/profile --var componentPrefix=Account --apply --json
```

Scaffolding is a dry-run unless `--apply` is present. Existing different files are reported as conflicts and are never overwritten.
