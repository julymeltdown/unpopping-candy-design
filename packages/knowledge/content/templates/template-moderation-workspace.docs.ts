export default {
  "schemaVersion": 1,
  "kind": "template",
  "id": "template.moderation-workspace",
  "name": "Moderation workspace",
  "version": "0.2.0",
  "status": "stable",
  "summary": "A three-region moderation decision workspace with queue, evidence, and controlled actions.",
  "description": "A three-region moderation decision workspace with queue, evidence, and controlled actions.",
  "keywords": [
    "moderation",
    "workspace",
    "template"
  ],
  "useWhen": [
    "A three-region moderation decision workspace with queue, evidence, and controlled actions."
  ],
  "avoidWhen": [
    "The target project uses a different framework or the requested surface is substantially smaller."
  ],
  "components": [
    "ui.container",
    "ui.surface",
    "ui.tabs",
    "ui.alert",
    "ui.button"
  ],
  "patterns": [
    "pattern.collection-states",
    "pattern.feedback-recovery"
  ],
  "files": [
    {
      "path": "src/moderation-workspace.tsx",
      "role": "Moderation workspace composition",
      "source": "registry/templates/moderation-workspace/src/moderation-workspace.tsx"
    },
    {
      "path": "src/moderation-workspace.css",
      "role": "Responsive workspace layout",
      "source": "registry/templates/moderation-workspace/src/moderation-workspace.css"
    }
  ],
  "variables": [
    {
      "name": "componentPrefix",
      "description": "Optional folder or component-name prefix.",
      "defaultValue": ""
    }
  ],
  "target": "react-vite",
  "accessibility": {
    "requirements": [
      "Keep semantic landmarks and visible focus styles.",
      "Run Storybook or browser accessibility checks after scaffolding."
    ]
  },
  "examples": {
    "preferred": [],
    "avoid": []
  }
} as const;
