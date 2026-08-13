export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "social.timeline-view",
  "name": "TimelineView",
  "package": "@unpopping-candy/social",
  "version": "0.1.0",
  "status": "stable",
  "category": "timeline",
  "summary": "Composes timeline states and rendered post rows without owning pagination or virtualization.",
  "sourcePath": "packages/social/src/timeline/timeline-view.tsx",
  "entrypoints": [
    "@unpopping-candy/social",
    "@unpopping-candy/social/timeline"
  ],
  "keywords": [
    "timeline",
    "feed",
    "list",
    "infinite-scroll"
  ],
  "useWhen": [
    "An application needs a consistent loading, empty, error, and populated timeline surface."
  ],
  "avoidWhen": [
    "The component would fetch pages itself.",
    "A static arbitrary list has no social semantics."
  ],
  "tokens": [
    "--popcandy-border",
    "--popcandy-surface"
  ],
  "related": [
    "social.post-card",
    "social.post-card-skeleton",
    "pattern.social-feed"
  ],
  "stories": [
    "catalog-social-timelineview--contract"
  ],
  "accessibility": {
    "requirements": [
      "Expose the list relationship with semantic list markup.",
      "Keep existing items when additional loading fails.",
      "Announce newly accepted items without moving focus."
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
    "initial-loading",
    "populated",
    "empty",
    "error",
    "loading-more"
  ],
  "examples": {
    "preferred": [
      {
        "title": "External pagination",
        "code": "<TimelineView posts={posts} renderPost={renderPost} loadingMore={isFetchingNextPage} />",
        "reason": "Keeps remote state outside presentation."
      }
    ],
    "avoid": []
  }
} as const;
