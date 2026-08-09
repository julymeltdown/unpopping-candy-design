export default {
  "schemaVersion": 1,
  "kind": "template",
  "id": "template.profile-settings",
  "name": "Profile settings",
  "version": "0.2.0",
  "status": "stable",
  "summary": "A profile settings form with validation, pending state, and preserved failure feedback.",
  "description": "A profile settings form with validation, pending state, and preserved failure feedback.",
  "keywords": [
    "profile",
    "settings",
    "template"
  ],
  "useWhen": [
    "A profile settings form with validation, pending state, and preserved failure feedback."
  ],
  "avoidWhen": [
    "The target project uses a different framework or the requested surface is substantially smaller."
  ],
  "components": [
    "ui.text-field",
    "ui.text-area",
    "ui.button",
    "ui.alert"
  ],
  "patterns": [
    "pattern.form-actions",
    "pattern.feedback-recovery"
  ],
  "files": [
    {
      "path": "src/profile-settings.tsx",
      "role": "Settings form",
      "source": "packages/registry/templates/profile-settings/src/profile-settings.tsx"
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
