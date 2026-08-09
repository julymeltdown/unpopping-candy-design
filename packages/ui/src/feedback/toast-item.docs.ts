export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.toast",
  "name": "Toast",
  "package": "@commonspace/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "feedback",
  "summary": "Renders one transient or persistent item from the feedback queue.",
  "sourcePath": "packages/ui/src/feedback/toast.tsx",
  "entrypoints": ["@commonspace/ui", "@commonspace/ui/feedback"],
  "keywords": ["toast", "notification", "confirmation", "global-feedback"],
  "useWhen": ["A result is global and does not require a fixed page position."],
  "avoidWhen": ["The message must remain beside its source; use Alert."],
  "tokens": ["--cs-surface", "--cs-shadow-dialog", "--cs-positive", "--cs-warning", "--cs-critical"],
  "related": ["ui.feedback-provider", "ui.toast-viewport"],
  "stories": ["catalog-ui--toast"],
  "accessibility": {
    "requirements": [
      "Neutral and success use polite live regions.",
      "Warning and critical use assertive announcements.",
      "Actions need clear labels and keyboard focus."
    ]
  },
  "props": [],
  "variants": [
    {"name": "neutral", "guidance": "Use for non-semantic information."},
    {"name": "success", "guidance": "Use after an operation has completed."},
    {"name": "warning", "guidance": "Use for recoverable failure or degraded state."},
    {"name": "critical", "guidance": "Use for security, session, or unrecoverable failure."}
  ],
  "states": ["entering", "visible", "leaving", "repeated"],
  "examples": {
    "preferred": [{
      "title": "Global confirmation",
      "code": "feedback.show({ tone: 'success', title: 'Link copied' })",
      "reason": "Communicates a short global result."
    }],
    "avoid": []
  }
} as const;
