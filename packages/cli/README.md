# @commonspace/cli

Deterministic local interface for Commonspace UI knowledge. It detects the current project, searches the exact bundled catalog, proposes composition plans, validates source usage, and later delegates guarded scaffolding to the Registry package.

```bash
commonspace info --json
commonspace search "profile settings" --json
commonspace get ui.button --json
commonspace compose "social moderation queue" --json
commonspace validate . --json
commonspace doctor --json
```

The CLI does not call a language model and does not send project data over the network.
