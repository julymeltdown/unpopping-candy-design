export default {
  "schemaVersion": 1,
  "kind": "pattern",
  "id": "pattern.social-feed",
  "name": "Social feed",
  "version": "0.2.0",
  "status": "stable",
  "summary": "Composes a readable, state-complete social timeline without moving content unexpectedly.",
  "keywords": [
    "social",
    "feed",
    "social-feed"
  ],
  "useWhen": [
    "A product needs the social feed pattern."
  ],
  "avoidWhen": [
    "A smaller primitive or a single component fully expresses the task."
  ],
  "components": [
    "social.timeline-view",
    "social.post-card",
    "social.post-card-skeleton",
    "social.post-composer-view"
  ],
  "anatomy": [
    "Feed controls",
    "Composer",
    "New-item notice",
    "Timeline rows",
    "Pagination sentinel"
  ],
  "states": [
    "initial-loading",
    "populated",
    "empty",
    "loading-more",
    "load-more-error",
    "new-items-available"
  ],
  "responsive": [
    "Keep one reading column on narrow viewports.",
    "Do not insert new rows above the current viewport without user action."
  ],
  "flow": [
    "Load or restore a snapshot.",
    "Render stable rows.",
    "Poll or subscribe for new-item count.",
    "Accept new items and reset to a new snapshot."
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
