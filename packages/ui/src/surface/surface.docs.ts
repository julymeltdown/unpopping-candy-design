export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.surface",
  "name": "Surface",
  "package": "@unpopping-candy/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "layout",
  "summary": "Creates a semantic background and boundary without prescribing product content.",
  "sourcePath": "packages/ui/src/surface/surface.tsx",
  "entrypoints": [
    "@unpopping-candy/ui",
    "@unpopping-candy/ui/layout"
  ],
  "keywords": [
    "surface",
    "panel",
    "card",
    "background"
  ],
  "useWhen": [
    "A local region needs contrast, padding, or elevation."
  ],
  "avoidWhen": [
    "Every item in a feed would become a nested card.",
    "Whitespace and a divider communicate the boundary better."
  ],
  "tokens": [
    "--popcandy-surface",
    "--popcandy-surface-muted",
    "--popcandy-border",
    "--popcandy-shadow-dialog"
  ],
  "related": [
    "ui.container",
    "ui.separator"
  ],
  "stories": [
    "catalog-ui-surface--contract"
  ],
  "accessibility": {
    "requirements": [
      "Interactive surfaces must use a semantic interactive element.",
      "Do not rely on elevation alone for grouping."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "plain",
      "guidance": "Use the plain variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "subtle",
      "guidance": "Use the subtle variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "raised",
      "guidance": "Use the raised variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default",
    "interactive"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Settings section",
        "code": "<Surface tone=\"subtle\"><Stack>...</Stack></Surface>",
        "reason": "Adds bounded contrast to a local region."
      }
    ],
    "avoid": []
  }
} as const;
