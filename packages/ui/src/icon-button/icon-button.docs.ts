export default {
  schemaVersion: 1,
  kind: "component",
  id: "ui.icon-button",
  name: "IconButton",
  package: "@unpopping-candy/ui",
  version: "0.1.0",
  status: "stable",
  category: "action",
  summary:
    "Triggers a frequent action where a well-known icon can replace visible text.",
  sourcePath: "packages/ui/src/icon-button/icon-button.tsx",
  entrypoints: ["@unpopping-candy/ui", "@unpopping-candy/ui/button"],
  keywords: ["icon", "button", "toolbar", "compact-action"],
  useWhen: ["A compact toolbar or repeated row action has a familiar icon."],
  avoidWhen: [
    "The action is unfamiliar or consequential; use a labeled Button.",
    "The icon is decorative.",
  ],
  tokens: [
    "--popcandy-button-height-md",
    "--popcandy-focus",
    "--popcandy-ink-muted",
  ],
  related: ["ui.button"],
  stories: ["catalog-ui-iconbutton--contract"],
  accessibility: {
    requirements: [
      "An aria-label is required.",
      "Tooltip text should match the accessible name.",
      "Pressed toggles must expose aria-pressed.",
    ],
  },
  props: [],
  variants: [
    {
      name: "ghost",
      guidance:
        "Use the ghost variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
    {
      name: "secondary",
      guidance:
        "Use the secondary variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
    {
      name: "danger",
      guidance:
        "Use the danger variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
  ],
  states: ["default", "hover", "focus-visible", "disabled", "pressed"],
  examples: {
    preferred: [
      {
        title: "Toolbar action",
        code: '<IconButton label="Bookmark post" icon={<BookmarkIcon />} />',
        reason: "Provides a stable accessible name.",
      },
    ],
    avoid: [
      {
        title: "Unnamed icon",
        code: "<IconButton><BookmarkIcon /></IconButton>",
        reason: "Screen-reader users cannot identify the action.",
      },
    ],
  },
} as const;
