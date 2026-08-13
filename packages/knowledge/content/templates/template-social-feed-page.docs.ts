export default {
  "schemaVersion": 1,
  "kind": "template",
  "id": "template.social-feed-page",
  "name": "Social feed page",
  "version": "0.2.0",
  "status": "stable",
  "summary": "A state-complete social feed page using presentation models and externally owned remote state.",
  "description": "A state-complete social feed page using presentation models and externally owned remote state.",
  "keywords": [
    "social",
    "feed",
    "page",
    "template",
    "post",
    "publish",
    "composer"
  ],
  "useWhen": [
    "A state-complete social feed page using presentation models and externally owned remote state."
  ],
  "avoidWhen": [
    "The target project uses a different framework or the requested surface is substantially smaller."
  ],
  "components": [
    "social.timeline-view",
    "social.post-card",
    "social.post-composer-view"
  ],
  "patterns": [
    "pattern.social-feed",
    "pattern.collection-states"
  ],
  "files": [
    {
      "path": "src/social-feed-page.tsx",
      "role": "Feed page composition",
      "source": "packages/registry/templates/social-feed-page/src/social-feed-page.tsx"
    },
    {
      "path": "src/social-feed-page.css",
      "role": "Page layout styles",
      "source": "packages/registry/templates/social-feed-page/src/social-feed-page.css"
    }
  ],
  "variables": [
    {
      "name": "componentPrefix",
      "description": "Optional folder or component-name prefix.",
      "defaultValue": ""
    }
  ],
  "target": "react-vite",
  "accessibility": {
    "requirements": [
      "Keep semantic landmarks and visible focus styles.",
      "Run Storybook or browser accessibility checks after scaffolding."
    ]
  },
  "examples": {
    "preferred": [],
    "avoid": []
  }
} as const;
