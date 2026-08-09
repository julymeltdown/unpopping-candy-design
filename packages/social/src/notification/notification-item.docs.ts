export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "social.notification-item",
  "name": "NotificationItem",
  "package": "@commonspace/social",
  "version": "0.1.0",
  "status": "stable",
  "category": "notification",
  "summary": "Presents one social notification with actor context, event description, and optional target content.",
  "sourcePath": "packages/social/src/notification/notification-item.tsx",
  "entrypoints": [
    "@commonspace/social",
    "@commonspace/social/notification"
  ],
  "keywords": [
    "notification",
    "activity",
    "mention",
    "social"
  ],
  "useWhen": [
    "A notification center renders typed social activity."
  ],
  "avoidWhen": [
    "A global application Toast is needed."
  ],
  "tokens": [
    "--cs-surface",
    "--cs-border",
    "--cs-ink-muted"
  ],
  "related": [
    "ui.toast",
    "pattern.collection-states"
  ],
  "stories": [
    "catalog-social--notification-item"
  ],
  "accessibility": {
    "requirements": [
      "Unread state must be communicated beyond color.",
      "Event text should make sense without relying on iconography.",
      "The row needs one predictable activation target."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "like",
      "guidance": "Use the like variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "reply",
      "guidance": "Use the reply variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "repost",
      "guidance": "Use the repost variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "follow",
      "guidance": "Use the follow variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "system",
      "guidance": "Use the system variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "unread",
    "read",
    "selected"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Notification list",
        "code": "<NotificationItem notification={item} onSelect={openTarget} />",
        "reason": "Keeps routing outside the package."
      }
    ],
    "avoid": []
  }
} as const;
