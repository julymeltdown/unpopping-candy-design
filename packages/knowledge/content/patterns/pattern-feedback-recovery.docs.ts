export default {
  "schemaVersion": 1,
  "kind": "pattern",
  "id": "pattern.feedback-recovery",
  "name": "Feedback and recovery",
  "version": "0.2.0",
  "status": "stable",
  "summary": "Chooses inline, global, or route-level feedback while preserving successful data and unfinished work.",
  "keywords": [
    "feedback",
    "and",
    "recovery",
    "feedback-recovery"
  ],
  "useWhen": [
    "A product needs the feedback and recovery pattern."
  ],
  "avoidWhen": [
    "A smaller primitive or a single component fully expresses the task."
  ],
  "components": [
    "ui.alert",
    "ui.feedback-provider",
    "ui.toast",
    "ui.empty-state",
    "ui.button"
  ],
  "anatomy": [
    "Failure boundary",
    "Preserved state statement",
    "Recovery action",
    "Request reference"
  ],
  "states": [
    "recoverable",
    "offline",
    "rate-limited",
    "critical",
    "recovered"
  ],
  "responsive": [
    "Keep inline feedback adjacent to its owning region.",
    "Place global toasts away from mobile navigation and safe areas."
  ],
  "flow": [
    "Classify the error.",
    "State what remains preserved.",
    "Offer one valid recovery action.",
    "Dismiss or reconcile after recovery."
  ],
  "stories": [],
  "accessibility": {
    "requirements": [
      "Preserve semantic reading and focus order.",
      "Represent loading, error, and empty states explicitly."
    ]
  },
  "examples": {
    "preferred": [],
    "avoid": []
  }
} as const;
