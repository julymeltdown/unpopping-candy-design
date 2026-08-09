export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "ui.dialog",
  "name": "Dialog",
  "package": "@commonspace/ui",
  "version": "0.1.0",
  "status": "stable",
  "category": "overlay",
  "summary": "Interrupts the current context for a focused task that must be completed or dismissed.",
  "sourcePath": "packages/ui/src/dialog/dialog.tsx",
  "entrypoints": [
    "@commonspace/ui",
    "@commonspace/ui/dialog"
  ],
  "keywords": [
    "dialog",
    "modal",
    "overlay",
    "confirmation"
  ],
  "useWhen": [
    "A short focused task cannot fit safely inline.",
    "A destructive action needs confirmation and consequence text."
  ],
  "avoidWhen": [
    "The content is a full workflow or route.",
    "A non-blocking message is sufficient."
  ],
  "tokens": [
    "--cs-dialog-width-md",
    "--cs-surface",
    "--cs-shadow-dialog",
    "--cs-focus"
  ],
  "related": [
    "ui.button",
    "ui.alert"
  ],
  "stories": [
    "catalog-ui--dialog"
  ],
  "accessibility": {
    "requirements": [
      "Move focus into the dialog on open and restore it on close.",
      "Provide a labelled title and optional description.",
      "Escape closes unless an irreversible operation is in progress."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "sm",
      "guidance": "Use the sm variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "md",
      "guidance": "Use the md variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "lg",
      "guidance": "Use the lg variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "closed",
    "opening",
    "open",
    "closing"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Confirm action",
        "code": "<Dialog open={open} onOpenChange={setOpen} title=\"Delete post?\">...</Dialog>",
        "reason": "Labels the modal and keeps open state controlled."
      }
    ],
    "avoid": []
  }
} as const;
