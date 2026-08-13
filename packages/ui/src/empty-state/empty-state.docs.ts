export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.empty-state",
  "name": "EmptyState",
  "package": "@unpopping-candy/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "feedback",
  "summary": "Explains why a meaningful region has no content and offers the next valid action.",
  "sourcePath": "packages/ui/src/empty-state/empty-state.tsx",
  "entrypoints": [
    "@unpopping-candy/ui"
  ],
  "keywords": [
    "empty",
    "zero-state",
    "no-results",
    "onboarding"
  ],
  "useWhen": [
    "A list, search, or workspace has no content."
  ],
  "avoidWhen": [
    "Data is still loading; use Skeleton.",
    "The region failed to load; use Alert."
  ],
  "tokens": [
    "--popcandy-ink",
    "--popcandy-ink-muted",
    "--popcandy-space-8"
  ],
  "related": [
    "ui.alert",
    "ui.skeleton"
  ],
  "stories": [
    "catalog-ui-emptystate--contract"
  ],
  "accessibility": {
    "requirements": [
      "Use a heading that identifies the empty condition.",
      "Do not imply failure when the empty state is valid."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "compact",
      "guidance": "Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "default",
      "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "first-use",
    "no-results",
    "cleared"
  ],
  "examples": {
    "preferred": [
      {
        "title": "No results",
        "code": "<EmptyState title=\"No matching curators\" description=\"Try a broader search.\" />",
        "reason": "Explains the condition and recovery."
      }
    ],
    "avoid": []
  }
} as const;
