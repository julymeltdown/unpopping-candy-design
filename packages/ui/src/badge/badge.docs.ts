export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.badge",
  "name": "Badge",
  "package": "@commonspace/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "data-display",
  "summary": "Displays a compact status or categorical label without becoming the primary action.",
  "sourcePath": "packages/ui/src/badge/badge.tsx",
  "entrypoints": [
    "@commonspace/ui",
    "@commonspace/ui/badge"
  ],
  "keywords": [
    "badge",
    "status",
    "label",
    "count"
  ],
  "useWhen": [
    "A short status, category, or count needs compact emphasis."
  ],
  "avoidWhen": [
    "The label is interactive; use Button, Tabs, or a link.",
    "The text is ordinary metadata and does not need a container."
  ],
  "tokens": [
    "--cs-surface-muted",
    "--cs-border",
    "--cs-ink-muted"
  ],
  "related": [
    "ui.alert"
  ],
  "stories": [
    "catalog-ui-badge--contract"
  ],
  "accessibility": {
    "requirements": [
      "Do not communicate state by color alone.",
      "Keep labels concise enough to remain readable at 200% zoom."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "neutral",
      "guidance": "Use the neutral variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "accent",
      "guidance": "Use the accent variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "positive",
      "guidance": "Use the positive variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "warning",
      "guidance": "Use the warning variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "critical",
      "guidance": "Use the critical variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Status",
        "code": "<Badge tone=\"positive\">Published</Badge>",
        "reason": "Pairs text with semantic color."
      }
    ],
    "avoid": []
  }
} as const;
