export default {
  "schemaVersion": 1,
  "kind": "pattern",
  "id": "pattern.profile-surface",
  "name": "Profile surface",
  "version": "0.2.0",
  "status": "stable",
  "summary": "Combines profile identity, relationship action, tabs, and state-complete collections.",
  "keywords": [
    "profile",
    "surface",
    "profile-surface"
  ],
  "useWhen": [
    "A product needs the profile surface pattern."
  ],
  "avoidWhen": [
    "A smaller primitive or a single component fully expresses the task."
  ],
  "components": [
    "social.profile-header",
    "social.user-cell",
    "ui.tabs",
    "ui.empty-state",
    "ui.alert"
  ],
  "anatomy": [
    "Profile identity",
    "Primary relationship action",
    "Peer view tabs",
    "Collection region"
  ],
  "states": [
    "loading",
    "self",
    "other",
    "private",
    "blocked",
    "not-found"
  ],
  "responsive": [
    "Stack identity and actions on narrow screens.",
    "Keep the primary action visible without covering biography text."
  ],
  "flow": [
    "Load profile and relationship summary.",
    "Choose the correct action state.",
    "Render the selected collection."
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
