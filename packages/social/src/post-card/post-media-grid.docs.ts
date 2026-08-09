export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "social.post-media-grid",
  "name": "PostMediaGrid",
  "package": "@unpopping-candy/social",
  "version": "0.1.0",
  "status": "stable",
  "category": "media",
  "summary": "Arranges one to four social media assets with stable aspect ratios and selection callbacks.",
  "sourcePath": "packages/social/src/post-card/post-media-grid.tsx",
  "entrypoints": [
    "@unpopping-candy/social",
    "@unpopping-candy/social/post"
  ],
  "keywords": [
    "media",
    "image",
    "video",
    "grid",
    "post"
  ],
  "useWhen": [
    "A post contains one to four media assets."
  ],
  "avoidWhen": [
    "Media requires editing or upload management.",
    "A general image gallery is being built."
  ],
  "tokens": [
    "--popcandy-border",
    "--popcandy-radius-md"
  ],
  "related": [
    "social.post-card"
  ],
  "stories": [
    "catalog-social-post-media-grid--contract"
  ],
  "accessibility": {
    "requirements": [
      "Every image needs useful alt text or an explicit decorative alt.",
      "Buttons opening media need labels that identify the selected item."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "one",
      "guidance": "Use the one variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "two",
      "guidance": "Use the two variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "three",
      "guidance": "Use the three variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "four",
      "guidance": "Use the four variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "loading",
    "ready",
    "error"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Post media",
        "code": "<PostMediaGrid media={post.media} onOpenMedia={openMedia} />",
        "reason": "Uses application-owned media behavior."
      }
    ],
    "avoid": []
  }
} as const;
