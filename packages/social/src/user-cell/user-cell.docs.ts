export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "social.user-cell",
  "name": "UserCell",
  "package": "@unpopping-candy/social",
  "version": "0.1.0",
  "status": "stable",
  "category": "identity",
  "summary": "Presents a compact person row with optional supporting text and injected action.",
  "sourcePath": "packages/social/src/user-cell/user-cell.tsx",
  "entrypoints": [
    "@unpopping-candy/social",
    "@unpopping-candy/social/user"
  ],
  "keywords": [
    "user",
    "identity",
    "row",
    "follow",
    "search-result"
  ],
  "useWhen": [
    "Search, followers, recommendations, or membership lists show people."
  ],
  "avoidWhen": [
    "A full profile context is needed; use ProfileHeader."
  ],
  "tokens": [
    "--popcandy-ink",
    "--popcandy-ink-muted",
    "--popcandy-border"
  ],
  "related": [
    "ui.avatar",
    "social.profile-header"
  ],
  "stories": [
    "catalog-social-user-cell--contract"
  ],
  "accessibility": {
    "requirements": [
      "If the entire row is interactive, preserve nested action behavior.",
      "Identity text must not be conveyed by avatar alone."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "default",
      "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "compact",
      "guidance": "Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default",
    "selected",
    "pending"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Search result",
        "code": "<UserCell user={user} onSelect={openProfile} action={<FollowButton />} />",
        "reason": "Separates row navigation and relationship action."
      }
    ],
    "avoid": []
  }
} as const;
