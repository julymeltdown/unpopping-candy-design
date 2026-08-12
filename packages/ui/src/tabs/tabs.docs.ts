export default {
  schemaVersion: 1,
  kind: "component",
  id: "ui.tabs",
  name: "Tabs",
  package: "@unpopping-candy/ui",
  version: "0.1.0",
  status: "stable",
  category: "navigation",
  summary:
    "Switches among peer views that share one context and URL or controlled state.",
  sourcePath: "packages/ui/src/tabs/tabs.tsx",
  entrypoints: ["@unpopping-candy/ui", "@unpopping-candy/ui/tabs"],
  keywords: ["tabs", "navigation", "view-switcher", "selection"],
  useWhen: ["A region has a small set of mutually exclusive peer views."],
  avoidWhen: [
    "The choices submit form data; use RadioGroup.",
    "The targets are unrelated pages in global navigation.",
  ],
  tokens: ["--popcandy-accent", "--popcandy-border", "--popcandy-focus"],
  related: ["ui.button"],
  stories: ["catalog-ui-tabs--contract"],
  accessibility: {
    requirements: [
      "Use tablist, tab, and tabpanel semantics.",
      "Support arrow-key movement and stable focus.",
      "Reflect restorable view state in the URL when appropriate.",
    ],
  },
  props: [],
  variants: [
    {
      name: "line",
      guidance:
        "Use the line variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
    {
      name: "compact",
      guidance:
        "Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
  ],
  states: ["default", "selected", "focus-visible", "disabled"],
  examples: {
    preferred: [
      {
        title: "Profile views",
        code: '<Tabs ariaLabel="Profile views" value={tab} onValueChange={setTab} items={items} />',
        reason: "Keeps selection controlled and explicit.",
      },
    ],
    avoid: [],
  },
} as const;
