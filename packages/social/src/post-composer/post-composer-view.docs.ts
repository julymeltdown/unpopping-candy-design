export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "social.post-composer-view",
  "name": "PostComposerView",
  "package": "@commonspace/social",
  "version": "0.1.0",
  "status": "stable",
  "category": "composer",
  "summary": "Presents a controlled social composer while the application owns draft, validation, upload, and publishing state.",
  "sourcePath": "packages/social/src/post-composer/post-composer-view.tsx",
  "entrypoints": [
    "@commonspace/social",
    "@commonspace/social/post"
  ],
  "keywords": [
    "composer",
    "post",
    "draft",
    "publish"
  ],
  "useWhen": [
    "A social product needs a reusable text-post composition surface."
  ],
  "avoidWhen": [
    "The component would need to own persistence, authentication, or uploads."
  ],
  "tokens": [
    "--cs-surface",
    "--cs-border",
    "--cs-accent",
    "--cs-field-height"
  ],
  "related": [
    "ui.text-area",
    "ui.button",
    "pattern.form-actions"
  ],
  "stories": [
    "catalog-social--post-composer-view"
  ],
  "accessibility": {
    "requirements": [
      "The text field needs a clear label.",
      "Character limits and errors must be announced.",
      "Publishing must retain the draft until success."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "inline",
      "guidance": "Use the inline variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "dialog",
      "guidance": "Use the dialog variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "empty",
    "draft",
    "invalid",
    "publishing",
    "failed"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Controlled draft",
        "code": "<PostComposerView value={draft} onChange={setDraft} onSubmit={publish} pending={pending} />",
        "reason": "Leaves workflow state in the consuming app."
      }
    ],
    "avoid": []
  }
} as const;
