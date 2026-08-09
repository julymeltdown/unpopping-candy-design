export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.alert",
  "name": "Alert",
  "package": "@commonspace/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "feedback",
  "summary": "Presents contextual feedback beside the task or content that produced it.",
  "sourcePath": "packages/ui/src/alert/alert.tsx",
  "entrypoints": [
    "@commonspace/ui",
    "@commonspace/ui/alert"
  ],
  "keywords": [
    "feedback",
    "error",
    "warning",
    "status",
    "callout"
  ],
  "useWhen": [
    "A message must remain visible until the user resolves or dismisses its cause.",
    "The message belongs to a specific form, panel, or data region."
  ],
  "avoidWhen": [
    "A short global confirmation is sufficient; use FeedbackProvider and Toast.",
    "The entire route is unusable; use a route-level error surface."
  ],
  "tokens": [
    "--cs-surface",
    "--cs-border",
    "--cs-positive",
    "--cs-warning",
    "--cs-critical"
  ],
  "related": [
    "ui.toast",
    "ui.empty-state",
    "pattern.feedback-recovery"
  ],
  "stories": [
    "catalog-ui-alert--contract"
  ],
  "accessibility": {
    "requirements": [
      "Use role=status for neutral and success feedback.",
      "Use role=alert for warning and critical feedback.",
      "Keep the title specific and state what remains preserved."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "neutral",
      "guidance": "Use the neutral variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "success",
      "guidance": "Use the success variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "warning",
      "guidance": "Use the warning variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "critical",
      "guidance": "Use the critical variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default",
    "with-action",
    "dismissible"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Recoverable failure",
        "code": "<Alert tone=\"warning\" title=\"Could not refresh posts\">Existing posts remain available.</Alert>",
        "reason": "Names the failure and preserved state."
      }
    ],
    "avoid": [
      {
        "title": "Raw server error",
        "code": "<Alert title={error.message} />",
        "reason": "May expose unsafe or irrelevant implementation details."
      }
    ]
  }
} as const;
