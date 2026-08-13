export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.feedback-provider",
  "name": "FeedbackProvider",
  "package": "@unpopping-candy/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "feedback",
  "summary": "Owns the application-level transient feedback queue and exposes a bounded controller.",
  "sourcePath": "packages/ui/src/feedback/feedback-provider.tsx",
  "entrypoints": [
    "@unpopping-candy/ui",
    "@unpopping-candy/ui/feedback"
  ],
  "keywords": [
    "toast",
    "feedback",
    "provider",
    "queue"
  ],
  "useWhen": [
    "An application needs global confirmations and non-blocking errors."
  ],
  "avoidWhen": [
    "Feedback belongs permanently beside a field or panel; use Alert."
  ],
  "tokens": [
    "--popcandy-dialog-width-sm",
    "--popcandy-shadow-dialog"
  ],
  "related": [
    "ui.toast",
    "ui.toast-viewport",
    "ui.alert"
  ],
  "stories": [
    "catalog-ui-feedbackprovider--contract"
  ],
  "accessibility": {
    "requirements": [
      "Mount one provider per feedback scope.",
      "Critical items remain until explicitly dismissed.",
      "Do not enqueue raw server messages."
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
    "idle",
    "queued",
    "announcing"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Application provider",
        "code": "<FeedbackProvider><App /></FeedbackProvider>",
        "reason": "Creates one deterministic queue."
      }
    ],
    "avoid": []
  }
} as const;
