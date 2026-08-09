export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.skeleton",
  "name": "Skeleton",
  "package": "@commonspace/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "loading",
  "summary": "Reserves stable geometry while content is loading.",
  "sourcePath": "packages/ui/src/skeleton/skeleton.tsx",
  "entrypoints": [
    "@commonspace/ui",
    "@commonspace/ui/loading"
  ],
  "keywords": [
    "skeleton",
    "loading",
    "placeholder"
  ],
  "useWhen": [
    "The final content shape is predictable and load time is perceptible."
  ],
  "avoidWhen": [
    "The operation is immediate or the layout is unknown; use Spinner or a simple pending label."
  ],
  "tokens": [
    "--cs-surface-muted",
    "--cs-motion-slow"
  ],
  "related": [
    "ui.spinner",
    "ui.empty-state"
  ],
  "stories": [
    "catalog-ui--skeleton"
  ],
  "accessibility": {
    "requirements": [
      "Mark the containing region busy.",
      "Skeleton elements themselves should be hidden from assistive technology.",
      "Respect reduced motion."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "text",
      "guidance": "Use the text variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "circle",
      "guidance": "Use the circle variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "block",
      "guidance": "Use the block variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "loading"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Timeline row",
        "code": "<Skeleton aria-hidden style={{ height: 160 }} />",
        "reason": "Reserves layout without announcing fake content."
      }
    ],
    "avoid": []
  }
} as const;
