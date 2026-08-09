export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.avatar",
  "name": "Avatar",
  "package": "@commonspace/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "identity",
  "summary": "Represents a person or organization with an image and deterministic fallback.",
  "sourcePath": "packages/ui/src/avatar/avatar.tsx",
  "entrypoints": [
    "@commonspace/ui",
    "@commonspace/ui/avatar"
  ],
  "keywords": [
    "avatar",
    "identity",
    "profile",
    "image",
    "initials"
  ],
  "useWhen": [
    "An identity must remain recognizable at compact sizes.",
    "A profile image may fail and needs a text fallback."
  ],
  "avoidWhen": [
    "The visual is decorative and has no identity meaning.",
    "A product or content thumbnail is being displayed."
  ],
  "tokens": [
    "--cs-surface-muted",
    "--cs-border",
    "--cs-ink"
  ],
  "related": [
    "social.user-cell"
  ],
  "stories": [
    "catalog-ui--avatar"
  ],
  "accessibility": {
    "requirements": [
      "Provide a useful accessible label through surrounding identity text.",
      "Use an empty alt value when the adjacent text already names the person."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "sm",
      "guidance": "Use the sm variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "md",
      "guidance": "Use the md variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "lg",
      "guidance": "Use the lg variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "image",
    "fallback",
    "loading"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Identity row",
        "code": "<Avatar src={user.avatarUrl} name={user.displayName} />",
        "reason": "Provides both image and fallback data."
      }
    ],
    "avoid": []
  }
} as const;
