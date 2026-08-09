export default {
  "schemaVersion": 1,
  "kind": "pattern",
  "id": "pattern.form-actions",
  "name": "Form actions",
  "version": "0.2.0",
  "status": "stable",
  "summary": "Orders validation, pending behavior, primary action, and cancellation for a form.",
  "keywords": [
    "form",
    "actions",
    "form-actions"
  ],
  "useWhen": [
    "A product needs the form actions pattern."
  ],
  "avoidWhen": [
    "A smaller primitive or a single component fully expresses the task."
  ],
  "components": [
    "ui.text-field",
    "ui.text-area",
    "ui.button",
    "ui.inline",
    "ui.stack",
    "ui.alert"
  ],
  "anatomy": [
    "Form fields",
    "Inline validation",
    "Form-level feedback",
    "Primary and secondary actions"
  ],
  "states": [
    "pristine",
    "dirty",
    "invalid",
    "submitting",
    "failed",
    "succeeded"
  ],
  "responsive": [
    "Stack actions on narrow screens when labels would wrap.",
    "Keep destructive actions separate from routine save actions."
  ],
  "flow": [
    "Validate fields.",
    "Move focus to the first invalid field.",
    "Submit once.",
    "Preserve input on failure."
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
