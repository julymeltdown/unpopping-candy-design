export default {
  "schemaVersion": 1,
  "kind": "template",
  "id": "template.fsd-social-shell",
  "name": "Strict FSD social shell",
  "version": "0.2.0",
  "status": "stable",
  "summary": "A React and Vite application shell that keeps Commonspace presentation packages below FSD application slices.",
  "description": "A React and Vite application shell that keeps Commonspace presentation packages below FSD application slices.",
  "keywords": [
    "strict",
    "fsd",
    "social",
    "shell",
    "template"
  ],
  "useWhen": [
    "A React and Vite application shell that keeps Commonspace presentation packages below FSD application slices."
  ],
  "avoidWhen": [
    "The target project uses a different framework or the requested surface is substantially smaller."
  ],
  "components": [
    "social.timeline-view",
    "social.post-card",
    "ui.feedback-provider"
  ],
  "patterns": [
    "pattern.social-feed",
    "pattern.feedback-recovery"
  ],
  "files": [
    {
      "path": "src/app/providers/commonspace-provider.tsx",
      "role": "Application provider composition",
      "source": "packages/registry/templates/fsd-social-shell/src/app/providers/commonspace-provider.tsx"
    },
    {
      "path": "src/pages/home/ui/home-page.tsx",
      "role": "Home page composition",
      "source": "packages/registry/templates/fsd-social-shell/src/pages/home/ui/home-page.tsx"
    },
    {
      "path": "src/widgets/post-feed/ui/post-feed.tsx",
      "role": "Reusable feed widget",
      "source": "packages/registry/templates/fsd-social-shell/src/widgets/post-feed/ui/post-feed.tsx"
    }
  ],
  "variables": [
    {
      "name": "componentPrefix",
      "description": "Optional folder or component-name prefix.",
      "defaultValue": ""
    }
  ],
  "target": "react-vite-fsd",
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
