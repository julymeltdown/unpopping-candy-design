export default {
  "schemaVersion": 1,
  "kind": "pattern",
  "id": "pattern.collection-states",
  "name": "Collection states",
  "version": "0.2.0",
  "status": "stable",
  "summary": "Provides complete loading, empty, populated, pagination, and error states for a collection.",
  "keywords": [
    "collection",
    "states",
    "collection-states"
  ],
  "useWhen": [
    "A product needs the collection states pattern."
  ],
  "avoidWhen": [
    "A smaller primitive or a single component fully expresses the task."
  ],
  "components": [
    "ui.skeleton",
    "ui.empty-state",
    "ui.alert",
    "ui.button",
    "ui.stack"
  ],
  "anatomy": [
    "Collection heading",
    "Controls",
    "Result region",
    "Pagination status"
  ],
  "states": [
    "initial-loading",
    "empty",
    "populated",
    "loading-more",
    "load-more-error",
    "filtered-empty"
  ],
  "responsive": [
    "Maintain readable row widths.",
    "Keep existing rows visible when pagination fails."
  ],
  "flow": [
    "Load the first page.",
    "Render the appropriate state.",
    "Append pages without duplicate rows."
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
