export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.text-area",
  "name": "TextArea",
  "package": "@unpopping-candy/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "form",
  "summary": "Collects multi-line text with label, description, validation, and native textarea semantics.",
  "sourcePath": "packages/ui/src/text-area/text-area.tsx",
  "entrypoints": [
    "@unpopping-candy/ui",
    "@unpopping-candy/ui/forms"
  ],
  "keywords": [
    "textarea",
    "form",
    "multiline",
    "input"
  ],
  "useWhen": [
    "The user writes more than one short line."
  ],
  "avoidWhen": [
    "The value is a single concise field; use TextField.",
    "Rich text structure is required."
  ],
  "tokens": [
    "--popcandy-field-height",
    "--popcandy-border",
    "--popcandy-focus",
    "--popcandy-critical"
  ],
  "related": [
    "ui.text-field",
    "pattern.form-actions"
  ],
  "stories": [
    "catalog-ui-textarea--contract"
  ],
  "accessibility": {
    "requirements": [
      "Every field requires a visible label or an equivalent accessible name.",
      "Connect descriptions and errors with aria-describedby.",
      "Expose aria-invalid when validation fails."
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
    "empty",
    "filled",
    "focus",
    "disabled",
    "invalid"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Biography",
        "code": "<TextArea label=\"Biography\" error={errors.bio} />",
        "reason": "Associates label and validation feedback."
      }
    ],
    "avoid": []
  }
} as const;
