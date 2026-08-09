export default {
  "schemaVersion": 1,
  "kind": "pattern",
  "id": "pattern.conversation-list",
  "name": "Conversation list",
  "version": "0.2.0",
  "status": "stable",
  "summary": "Renders conversations with stable selection, unread semantics, and responsive detail navigation.",
  "keywords": [
    "conversation",
    "list",
    "conversation-list"
  ],
  "useWhen": [
    "A product needs the conversation list pattern."
  ],
  "avoidWhen": [
    "A smaller primitive or a single component fully expresses the task."
  ],
  "components": [
    "social.conversation-preview",
    "ui.empty-state",
    "ui.skeleton",
    "ui.alert"
  ],
  "anatomy": [
    "Inbox heading",
    "Conversation rows",
    "Unread indicator",
    "Selected detail boundary"
  ],
  "states": [
    "loading",
    "empty",
    "populated",
    "selected",
    "offline"
  ],
  "responsive": [
    "Use a single-column route transition on small screens.",
    "Use split view only when both panes remain usable."
  ],
  "flow": [
    "Load conversations.",
    "Restore selected conversation from the URL.",
    "Reconcile realtime updates without losing selection."
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
