export default {
  "schemaVersion": 1,
  "kind": "template",
  "id": "template.vite-app-shell",
  "name": "Vite app shell",
  "version": "0.2.0",
  "status": "stable",
  "summary": "A minimal React and Vite shell with Commonspace theme and feedback providers.",
  "description": "A minimal React and Vite shell with Commonspace theme and feedback providers.",
  "keywords": [
    "vite",
    "app",
    "shell",
    "template"
  ],
  "useWhen": [
    "A minimal React and Vite shell with Commonspace theme and feedback providers."
  ],
  "avoidWhen": [
    "The target project uses a different framework or the requested surface is substantially smaller."
  ],
  "components": [
    "ui.container",
    "ui.feedback-provider",
    "ui.stack"
  ],
  "patterns": [
    "pattern.feedback-recovery"
  ],
  "files": [
    {
      "path": "src/app.tsx",
      "role": "Root application component",
      "source": "packages/registry/templates/vite-app-shell/src/app.tsx"
    },
    {
      "path": "src/main.tsx",
      "role": "Browser entry",
      "source": "packages/registry/templates/vite-app-shell/src/main.tsx"
    },
    {
      "path": "src/styles.css",
      "role": "Application-level styles",
      "source": "packages/registry/templates/vite-app-shell/src/styles.css"
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
