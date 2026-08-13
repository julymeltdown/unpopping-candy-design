export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.text-field",
  "name": "TextField",
  "package": "@unpopping-candy/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "form",
  "summary": "Collects one short value with label, description, validation, and native input semantics.",
  "sourcePath": "packages/ui/src/text-field/text-field.tsx",
  "entrypoints": [
    "@unpopping-candy/ui",
    "@unpopping-candy/ui/forms"
  ],
  "keywords": [
    "input",
    "form",
    "text-field",
    "search"
  ],
  "useWhen": [
    "The user enters a concise value such as a name, email, or query."
  ],
  "avoidWhen": [
    "Multi-line input is expected; use TextArea.",
    "A fixed choice set is known; use a selection control."
  ],
  "tokens": [
    "--popcandy-field-height",
    "--popcandy-border",
    "--popcandy-focus",
    "--popcandy-critical"
  ],
  "related": [
    "ui.text-area",
    "pattern.form-actions"
  ],
  "stories": [
    "catalog-ui-textfield--contract"
  ],
  "accessibility": {
    "requirements": [
      "Every field requires a visible label or equivalent accessible name.",
      "Connect descriptions and errors with aria-describedby.",
      "Use an appropriate autocomplete value for personal data."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "text",
      "guidance": "Use the text variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "email",
      "guidance": "Use the email variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "password",
      "guidance": "Use the password variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "search",
      "guidance": "Use the search variant only when its semantic role matches the surrounding decision or content hierarchy."
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
        "title": "Email",
        "code": "<TextField label=\"Email\" type=\"email\" autoComplete=\"email\" />",
        "reason": "Uses native semantics and autofill metadata."
      }
    ],
    "avoid": []
  }
} as const;
