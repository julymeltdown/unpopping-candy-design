export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.toast-viewport",
  "name": "ToastViewport",
  "package": "@unpopping-candy/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "feedback",
  "summary": "Positions and announces the bounded stack of global feedback items.",
  "sourcePath": "packages/ui/src/feedback/toast.tsx",
  "entrypoints": [
    "@unpopping-candy/ui",
    "@unpopping-candy/ui/feedback"
  ],
  "keywords": [
    "toast",
    "viewport",
    "queue",
    "overlay"
  ],
  "useWhen": [
    "FeedbackProvider needs a visible output region."
  ],
  "avoidWhen": [
    "A page needs a custom notification center."
  ],
  "tokens": [
    "--popcandy-dialog-width-sm",
    "--popcandy-space-4"
  ],
  "related": [
    "ui.feedback-provider",
    "ui.toast"
  ],
  "stories": [
    "catalog-ui-toastviewport--contract"
  ],
  "accessibility": {
    "requirements": [
      "Avoid covering primary navigation and mobile safe areas.",
      "Keep DOM order consistent with announcement order."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "top-right",
      "guidance": "Use the top-right variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "bottom-right",
      "guidance": "Use the bottom-right variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "bottom-center",
      "guidance": "Use the bottom-center variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "empty",
    "populated"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Default viewport",
        "code": "<ToastViewport items={items} onDismiss={dismiss} />",
        "reason": "Binds queue state to presentation."
      }
    ],
    "avoid": []
  }
} as const;
