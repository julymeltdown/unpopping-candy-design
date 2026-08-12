export default {
  schemaVersion: 1,
  kind: "component",
  id: "social.post-actions",
  name: "PostActions",
  package: "@unpopping-candy/social",
  version: "0.1.0",
  status: "stable",
  category: "post",
  summary:
    "Presents reply, repost, like, bookmark, and share actions as controlled social interactions.",
  sourcePath: "packages/social/src/post-card/post-actions.tsx",
  entrypoints: ["@unpopping-candy/social", "@unpopping-candy/social/post"],
  keywords: ["post", "actions", "reply", "repost", "like", "bookmark"],
  useWhen: ["A post exposes standard engagement actions."],
  avoidWhen: [
    "A product has different action semantics; compose explicit Buttons instead.",
  ],
  tokens: [
    "--popcandy-ink-muted",
    "--popcandy-accent",
    "--popcandy-positive",
    "--popcandy-critical",
  ],
  related: ["social.post-card", "ui.icon-button"],
  stories: ["catalog-social-post-actions--contract"],
  accessibility: {
    requirements: [
      "Each icon action needs an accessible label and pressed state.",
      "Pending state must prevent duplicate mutation without erasing current state.",
    ],
  },
  props: [],
  variants: [
    {
      name: "default",
      guidance:
        "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
    {
      name: "compact",
      guidance:
        "Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
  ],
  states: ["idle", "liked", "reposted", "bookmarked", "pending"],
  examples: {
    preferred: [
      {
        title: "Injected actions",
        code: "<PostActions metrics={post.metrics} viewerState={post.viewerState} onLike={onLike} pendingAction={pending} />",
        reason: "Keeps mutation ownership outside the component.",
      },
    ],
    avoid: [],
  },
} as const;
