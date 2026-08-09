export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.spinner",
  "name": "Spinner",
  "package": "@commonspace/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "loading",
  "summary": "Indicates an indeterminate operation in a compact region.",
  "sourcePath": "packages/ui/src/spinner/spinner.tsx",
  "entrypoints": [
    "@commonspace/ui",
    "@commonspace/ui/loading"
  ],
  "keywords": [
    "spinner",
    "loading",
    "progress",
    "pending"
  ],
  "useWhen": [
    "A control or small region is waiting and final geometry is unknown."
  ],
  "avoidWhen": [
    "A full content layout can be represented with Skeleton.",
    "Progress is measurable; use a determinate progress indicator."
  ],
  "tokens": [
    "--cs-accent",
    "--cs-motion-fast"
  ],
  "related": [
    "ui.skeleton",
    "ui.button"
  ],
  "stories": [
    "catalog-ui-spinner--contract"
  ],
  "accessibility": {
    "requirements": [
      "Provide a visible or visually hidden loading label.",
      "Respect reduced motion without removing the state indication."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "sm",
      "guidance": "Use the sm variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "md",
      "guidance": "Use the md variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "lg",
      "guidance": "Use the lg variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "active"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Pending control",
        "code": "<Spinner label=\"Saving changes\" />",
        "reason": "Announces the current operation."
      }
    ],
    "avoid": []
  }
} as const;
