export default {
  schemaVersion: 1,
  kind: "component",
  id: "ui.inline",
  name: "Inline",
  package: "@unpopping-candy/ui",
  version: "0.1.0",
  status: "stable",
  category: "layout",
  summary:
    "Arranges related items horizontally with tokenized gap, alignment, and wrapping.",
  sourcePath: "packages/ui/src/inline/inline.tsx",
  entrypoints: ["@unpopping-candy/ui", "@unpopping-candy/ui/layout"],
  keywords: ["inline", "row", "layout", "gap", "wrap"],
  useWhen: [
    "Actions, metadata, or compact controls form one horizontal group.",
  ],
  avoidWhen: ["Items represent a vertical reading sequence; use Stack."],
  tokens: [
    "--popcandy-space-1",
    "--popcandy-space-2",
    "--popcandy-space-3",
    "--popcandy-space-4",
  ],
  related: ["ui.stack", "ui.separator"],
  stories: ["catalog-ui-inline--contract"],
  accessibility: {
    requirements: [
      "Allow wrapping when labels may grow or localize.",
      "Preserve a logical DOM order.",
    ],
  },
  props: [],
  variants: [
    {
      name: "start",
      guidance:
        "Use the start variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
    {
      name: "center",
      guidance:
        "Use the center variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
    {
      name: "end",
      guidance:
        "Use the end variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
    {
      name: "space-between",
      guidance:
        "Use the space-between variant only when its semantic role matches the surrounding decision or content hierarchy.",
    },
  ],
  states: ["nowrap", "wrap"],
  examples: {
    preferred: [
      {
        title: "Action row",
        code: '<Inline gap={3}><Button>Save</Button><Button variant="secondary">Cancel</Button></Inline>',
        reason: "Groups related actions without arbitrary margins.",
      },
    ],
    avoid: [],
  },
} as const;
