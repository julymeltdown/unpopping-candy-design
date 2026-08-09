export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.visually-hidden",
  "name": "VisuallyHidden",
  "package": "@commonspace/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "accessibility",
  "summary": "Keeps essential text available to assistive technology without changing visual layout.",
  "sourcePath": "packages/ui/src/visually-hidden/visually-hidden.tsx",
  "entrypoints": [
    "@commonspace/ui"
  ],
  "keywords": [
    "accessibility",
    "screen-reader",
    "hidden-label"
  ],
  "useWhen": [
    "An icon-only control or visual pattern needs an accessible text equivalent."
  ],
  "avoidWhen": [
    "Content should be hidden from everyone; do not render it.",
    "Visible instructions would benefit all users."
  ],
  "tokens": [
    "--cs-space-0"
  ],
  "related": [
    "ui.icon-button",
    "ui.spinner"
  ],
  "stories": [
    "catalog-ui-visually-hidden--contract"
  ],
  "accessibility": {
    "requirements": [
      "Hidden text must remain in the accessibility tree.",
      "Do not use it to conceal focusable controls."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "default",
      "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Loading name",
        "code": "<Spinner><VisuallyHidden>Loading posts</VisuallyHidden></Spinner>",
        "reason": "Retains an accessible name."
      }
    ],
    "avoid": []
  }
} as const;
