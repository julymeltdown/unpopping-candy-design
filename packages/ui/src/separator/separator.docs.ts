export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.separator",
  "name": "Separator",
  "package": "@unpopping-candy/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "layout",
  "summary": "Separates adjacent regions when spacing alone cannot communicate the boundary.",
  "sourcePath": "packages/ui/src/separator/separator.tsx",
  "entrypoints": [
    "@unpopping-candy/ui",
    "@unpopping-candy/ui/layout"
  ],
  "keywords": [
    "separator",
    "divider",
    "rule"
  ],
  "useWhen": [
    "Two peer regions need a visible boundary."
  ],
  "avoidWhen": [
    "The rule is decorative only and adds visual noise."
  ],
  "tokens": [
    "--popcandy-border"
  ],
  "related": [
    "ui.stack",
    "ui.surface"
  ],
  "stories": [
    "catalog-ui-separator--contract"
  ],
  "accessibility": {
    "requirements": [
      "Use semantic hr behavior for meaningful thematic breaks.",
      "Hide purely decorative separators from assistive technology."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "horizontal",
      "guidance": "Use the horizontal variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "vertical",
      "guidance": "Use the vertical variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Section boundary",
        "code": "<Separator />",
        "reason": "Uses the shared border token."
      }
    ],
    "avoid": []
  }
} as const;
