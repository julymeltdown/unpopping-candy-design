export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "social.post-header",
  "name": "PostHeader",
  "package": "@unpopping-candy/social",
  "version": "0.1.0",
  "status": "stable",
  "category": "post",
  "summary": "Presents post identity, timestamp, and distribution context without owning navigation.",
  "sourcePath": "packages/social/src/post-card/post-header.tsx",
  "entrypoints": [
    "@unpopping-candy/social",
    "@unpopping-candy/social/post"
  ],
  "keywords": [
    "post",
    "author",
    "identity",
    "timestamp"
  ],
  "useWhen": [
    "A post or compact content item needs consistent identity metadata."
  ],
  "avoidWhen": [
    "A generic person row is needed; use UserCell."
  ],
  "tokens": [
    "--popcandy-ink",
    "--popcandy-ink-muted"
  ],
  "related": [
    "social.post-card",
    "social.user-cell"
  ],
  "stories": [
    "catalog-social-post-header--contract"
  ],
  "accessibility": {
    "requirements": [
      "Timestamp text should expose a meaningful date to assistive technology.",
      "Author navigation is supplied as a callback or link wrapper by the application."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "default",
      "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "repost-context",
      "guidance": "Use the repost-context variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default",
    "verified"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Post identity",
        "code": "<PostHeader post={post} onOpenAuthor={openAuthor} />",
        "reason": "Injects navigation behavior."
      }
    ],
    "avoid": []
  }
} as const;
