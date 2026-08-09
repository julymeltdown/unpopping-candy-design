export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "social.profile-header",
  "name": "ProfileHeader",
  "package": "@commonspace/social",
  "version": "0.1.0",
  "status": "stable",
  "category": "profile",
  "summary": "Presents a curator or user profile summary with injected primary and secondary actions.",
  "sourcePath": "packages/social/src/profile/profile-header.tsx",
  "entrypoints": [
    "@commonspace/social",
    "@commonspace/social/profile"
  ],
  "keywords": [
    "profile",
    "header",
    "identity",
    "follow"
  ],
  "useWhen": [
    "A profile route needs consistent cover, identity, biography, and counts."
  ],
  "avoidWhen": [
    "A compact list row is sufficient; use UserCell."
  ],
  "tokens": [
    "--cs-surface",
    "--cs-border",
    "--cs-ink",
    "--cs-ink-muted"
  ],
  "related": [
    "social.user-cell",
    "pattern.profile-surface"
  ],
  "stories": [
    "catalog-social--profile-header"
  ],
  "accessibility": {
    "requirements": [
      "Heading levels must fit the page hierarchy.",
      "Counts need complete accessible labels.",
      "Cover imagery must not hide identity text."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "self",
      "guidance": "Use the self variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "other",
      "guidance": "Use the other variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "private",
      "guidance": "Use the private variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default",
    "following",
    "pending",
    "blocked"
  ],
  "examples": {
    "preferred": [
      {
        "title": "External relationship action",
        "code": "<ProfileHeader profile={profile} action={<FollowButton />} />",
        "reason": "Keeps relationship behavior in the application."
      }
    ],
    "avoid": []
  }
} as const;
