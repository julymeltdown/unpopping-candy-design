export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.button",
  "name": "Button",
  "package": "@commonspace/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "action",
  "summary": "Triggers an immediate user action with explicit priority and pending behavior.",
  "sourcePath": "packages/ui/src/button/button.tsx",
  "entrypoints": [
    "@commonspace/ui",
    "@commonspace/ui/button"
  ],
  "keywords": [
    "button",
    "action",
    "submit",
    "confirm",
    "delete"
  ],
  "useWhen": [
    "The user can perform an immediate action.",
    "A decision region needs one clearly prioritized primary action."
  ],
  "avoidWhen": [
    "The target is navigation; use a link.",
    "The control only contains an icon; use IconButton."
  ],
  "tokens": [
    "--cs-button-height-md",
    "--cs-accent",
    "--cs-critical",
    "--cs-focus"
  ],
  "related": [
    "ui.icon-button",
    "pattern.form-actions"
  ],
  "stories": [
    "catalog-ui--button"
  ],
  "accessibility": {
    "requirements": [
      "Use an action verb as the accessible name.",
      "Pending state must preserve the accessible name and disable duplicate submission.",
      "Use danger only for destructive actions with clear consequences."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "primary",
      "guidance": "Use the primary variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "secondary",
      "guidance": "Use the secondary variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "ghost",
      "guidance": "Use the ghost variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "danger",
      "guidance": "Use the danger variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default",
    "hover",
    "focus-visible",
    "disabled",
    "pending"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Primary action",
        "code": "<Button pending={isSaving}>Save changes</Button>",
        "reason": "One clear verb and stable pending state."
      }
    ],
    "avoid": [
      {
        "title": "Navigation",
        "code": "<Button onClick={() => navigate('/settings')}>Settings</Button>",
        "reason": "Navigation should preserve link semantics."
      }
    ]
  }
} as const;
