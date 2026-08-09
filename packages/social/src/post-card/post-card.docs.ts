export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "social.post-card",
  "name": "PostCard",
  "package": "@commonspace/social",
  "version": "0.1.0",
  "status": "stable",
  "category": "post",
  "summary": "Presents a social post with author, content, distribution context, metrics, and injected actions.",
  "sourcePath": "packages/social/src/post-card/post-card.tsx",
  "entrypoints": [
    "@commonspace/social",
    "@commonspace/social/post"
  ],
  "keywords": [
    "post",
    "social",
    "content",
    "timeline"
  ],
  "useWhen": [
    "A timeline or thread needs a complete post presentation."
  ],
  "avoidWhen": [
    "The application needs to fetch or mutate post data inside the component.",
    "A compact reference is sufficient; use a post summary pattern."
  ],
  "tokens": [
    "--cs-surface",
    "--cs-border",
    "--cs-ink",
    "--cs-accent"
  ],
  "related": [
    "social.post-header",
    "social.post-actions",
    "social.post-media-grid",
    "pattern.social-feed"
  ],
  "stories": [
    "catalog-social--post-card"
  ],
  "accessibility": {
    "requirements": [
      "The outer interactive region must not swallow nested action focus.",
      "Media requires alternative text.",
      "Metrics must have accessible labels, not numbers alone."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "timeline",
      "guidance": "Use the timeline variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "detail",
      "guidance": "Use the detail variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "quoted",
      "guidance": "Use the quoted variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "default",
    "selected",
    "pending-action",
    "deleted"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Controlled post",
        "code": "<PostCard post={post} onLike={() => onLike(post.id)} onOpenPost={() => open(post.id)} />",
        "reason": "Keeps network and routing concerns in the consuming application."
      }
    ],
    "avoid": [
      {
        "title": "Fetching inside",
        "code": "function PostCard({ id }) { const post = useQuery(...); }",
        "reason": "Couples presentation to one data layer and prevents isolated use."
      }
    ]
  }
} as const;
