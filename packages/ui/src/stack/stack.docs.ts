export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.stack",
  "name": "Stack",
  "package": "@unpopping-candy/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "layout",
  "summary": "Arranges a vertical reading or task sequence with tokenized spacing.",
  "sourcePath": "packages/ui/src/stack/stack.tsx",
  "entrypoints": [
    "@unpopping-candy/ui",
    "@unpopping-candy/ui/layout"
  ],
  "keywords": [
    "stack",
    "column",
    "layout",
    "gap"
  ],
  "useWhen": [
    "Content forms a vertical hierarchy or workflow."
  ],
  "avoidWhen": [
    "Items form a compact horizontal group; use Inline."
  ],
  "tokens": [
    "--popcandy-space-1",
    "--popcandy-space-2",
    "--popcandy-space-3",
    "--popcandy-space-4",
    "--popcandy-space-6"
  ],
  "related": [
    "ui.inline",
    "ui.container"
  ],
  "stories": [
    "catalog-ui-stack--contract"
  ],
  "accessibility": {
    "requirements": [
      "Do not change semantic order for visual layout.",
      "Use responsive gaps rather than arbitrary child margins."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "xs",
      "guidance": "Use the xs variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
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
    },
    {
      "name": "xl",
      "guidance": "Use the xl variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Form layout",
        "code": "<Stack gap=\"md\"><TextField /><TextArea /></Stack>",
        "reason": "Creates consistent vertical rhythm."
      }
    ],
    "avoid": []
  }
} as const;
