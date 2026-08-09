export default {
  "schemaVersion": 1,
  "kind": "component",
  "id": "social.conversation-preview",
  "name": "ConversationPreview",
  "package": "@commonspace/social",
  "version": "0.1.0",
  "status": "stable",
  "category": "messaging",
  "summary": "Presents a conversation summary with participants, latest message, time, and unread state.",
  "sourcePath": "packages/social/src/conversation/conversation-preview.tsx",
  "entrypoints": [
    "@commonspace/social",
    "@commonspace/social/conversation"
  ],
  "keywords": [
    "conversation",
    "message",
    "inbox",
    "preview"
  ],
  "useWhen": [
    "A messaging inbox lists conversations."
  ],
  "avoidWhen": [
    "A message bubble or full thread is required."
  ],
  "tokens": [
    "--cs-surface",
    "--cs-border",
    "--cs-ink-muted",
    "--cs-accent"
  ],
  "related": [
    "social.user-cell",
    "pattern.conversation-list"
  ],
  "stories": [
    "catalog-social-conversation-preview--contract"
  ],
  "accessibility": {
    "requirements": [
      "Unread state needs text or a labelled indicator.",
      "The preview needs a clear accessible name combining participant and latest message."
    ]
  },
  "props": [],
  "variants": [
    {
      "name": "direct",
      "guidance": "Use the direct variant only when its semantic role matches the surrounding decision or content hierarchy."
    },
    {
      "name": "group",
      "guidance": "Use the group variant only when its semantic role matches the surrounding decision or content hierarchy."
    }
  ],
  "states": [
    "read",
    "unread",
    "selected",
    "muted"
  ],
  "examples": {
    "preferred": [
      {
        "title": "Inbox row",
        "code": "<ConversationPreview conversation={conversation} onSelect={openConversation} />",
        "reason": "Injects navigation and keeps data ownership external."
      }
    ],
    "avoid": []
  }
} as const;
