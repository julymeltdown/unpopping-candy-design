export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.container",
  "name": "Container",
  "package": "@unpopping-candy/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "layout",
  "summary": "Constrains page content to a readable width and consistent horizontal gutter.",
  "sourcePath": "packages/ui/src/container/container.tsx",
  "entrypoints": [
    "@unpopping-candy/ui",
    "@unpopping-candy/ui/layout"
  ],
  "keywords": [
    "container",
    "layout",
    "width",
    "gutter"
  ],
  "useWhen": [
    "A page or section needs the standard Unpopping Candy reading width."
  ],
  "avoidWhen": [
    "The element must be full bleed.",
    "A local group only needs spacing; use Stack or Inline."
  ],
  "tokens": [
    "--popcandy-space-4",
    "--popcandy-space-6",
    "--popcandy-shell-max"
  ],
  "related": [
    "ui.stack",
    "ui.inline"
  ],
  "stories": [
    "catalog-ui-container--contract"
  ],
  "accessibility": {
    "requirements": [
      "Container must not prevent 320px reflow.",
      "Landmark semantics belong to the element passed through asChild or wrapping structure."
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
    },
    {
      "name": "full",
      "guidance": "Use the full variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Page shell",
        "code": "<Container size=\"lg\"><main>{children}</main></Container>",
        "reason": "Uses standard gutters and width."
      }
    ],
    "avoid": []
  }
} as const;
