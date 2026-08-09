export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "social.post-card-skeleton",
  "name": "PostCardSkeleton",
  "package": "@unpopping-candy/social",
  "version": "0.1.0",
  "status": "stable",
  "category": "loading",
  "summary": "Reserves the expected geometry of a PostCard while timeline data loads.",
  "sourcePath": "packages/social/src/post-card/post-card-skeleton.tsx",
  "entrypoints": [
    "@unpopping-candy/social",
    "@unpopping-candy/social/post"
  ],
  "keywords": [
    "post",
    "skeleton",
    "loading",
    "timeline"
  ],
  "useWhen": [
    "A timeline is loading its first page."
  ],
  "avoidWhen": [
    "Existing posts are available and only another page is loading."
  ],
  "tokens": [
    "--popcandy-surface-muted"
  ],
  "related": [
    "social.post-card",
    "ui.skeleton"
  ],
  "stories": [
    "catalog-social-post-card-skeleton--contract"
  ],
  "accessibility": {
    "requirements": [
      "Mark the containing timeline region busy.",
      "Do not expose placeholder text as content."
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
    "loading"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Initial timeline",
        "code": "<PostCardSkeleton />",
        "reason": "Matches the post layout without fake content."
      }
    ],
    "avoid": []
  }
} as const;
