import type { KnowledgeCatalog } from '../types.ts';

export const bundledCatalog = {
  "schemaVersion": 1,
  "generatedAt": "2026-08-09T00:00:00.000Z",
  "packageVersion": "0.2.0",
  "entries": [
    {
      "schemaVersion": 1,
      "kind": "migration",
      "id": "migration.0-1-to-0-2",
      "name": "Unpopping Candy 0.1 to 0.2",
      "version": "0.2.0",
      "status": "stable",
      "summary": "Introduces the AI-native knowledge, CLI, MCP, Registry, and generated-document layer without changing existing visual package APIs.",
      "keywords": [
        "migration",
        "0.1",
        "0.2",
        "ai",
        "knowledge"
      ],
      "useWhen": [
        "A 0.1.x consumer adopts the 0.2 AI tooling and generated documentation."
      ],
      "avoidWhen": [
        "The project only consumes visual packages and does not need AI tooling."
      ],
      "fromVersion": "0.1.0",
      "toVersion": "0.2.0",
      "changes": [
        {
          "kind": "manual",
          "from": "Hand-written DESIGN.md",
          "to": "Generated DESIGN.md",
          "guidance": "Edit component and pattern metadata, then regenerate agent artifacts."
        },
        {
          "kind": "manual",
          "from": "Unstructured component discovery",
          "to": "popcandy search and MCP resources",
          "guidance": "Run project detection before generating interfaces."
        },
        {
          "kind": "manual",
          "from": "Visual package source imports",
          "to": "Published package entrypoints",
          "guidance": "Continue importing only documented @unpopping-candy/* entrypoints."
        }
      ],
      "accessibility": {
        "requirements": [
          "No visual or interaction behavior changes are implied by adopting the tooling layer."
        ]
      },
      "examples": {
        "preferred": [],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "pattern",
      "id": "pattern.collection-states",
      "name": "Collection states",
      "version": "0.2.0",
      "status": "stable",
      "summary": "Provides complete loading, empty, populated, pagination, and error states for a collection.",
      "keywords": [
        "collection",
        "states",
        "collection-states"
      ],
      "useWhen": [
        "A product needs the collection states pattern."
      ],
      "avoidWhen": [
        "A smaller primitive or a single component fully expresses the task."
      ],
      "components": [
        "ui.skeleton",
        "ui.empty-state",
        "ui.alert",
        "ui.button",
        "ui.stack"
      ],
      "anatomy": [
        "Collection heading",
        "Controls",
        "Result region",
        "Pagination status"
      ],
      "states": [
        "initial-loading",
        "empty",
        "populated",
        "loading-more",
        "load-more-error",
        "filtered-empty"
      ],
      "responsive": [
        "Maintain readable row widths.",
        "Keep existing rows visible when pagination fails."
      ],
      "flow": [
        "Load the first page.",
        "Render the appropriate state.",
        "Append pages without duplicate rows."
      ],
      "stories": [],
      "accessibility": {
        "requirements": [
          "Preserve semantic reading and focus order.",
          "Represent loading, error, and empty states explicitly."
        ]
      },
      "examples": {
        "preferred": [],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "pattern",
      "id": "pattern.conversation-list",
      "name": "Conversation list",
      "version": "0.2.0",
      "status": "stable",
      "summary": "Renders conversations with stable selection, unread semantics, and responsive detail navigation.",
      "keywords": [
        "conversation",
        "list",
        "conversation-list"
      ],
      "useWhen": [
        "A product needs the conversation list pattern."
      ],
      "avoidWhen": [
        "A smaller primitive or a single component fully expresses the task."
      ],
      "components": [
        "social.conversation-preview",
        "ui.empty-state",
        "ui.skeleton",
        "ui.alert"
      ],
      "anatomy": [
        "Inbox heading",
        "Conversation rows",
        "Unread indicator",
        "Selected detail boundary"
      ],
      "states": [
        "loading",
        "empty",
        "populated",
        "selected",
        "offline"
      ],
      "responsive": [
        "Use a single-column route transition on small screens.",
        "Use split view only when both panes remain usable."
      ],
      "flow": [
        "Load conversations.",
        "Restore selected conversation from the URL.",
        "Reconcile realtime updates without losing selection."
      ],
      "stories": [],
      "accessibility": {
        "requirements": [
          "Preserve semantic reading and focus order.",
          "Represent loading, error, and empty states explicitly."
        ]
      },
      "examples": {
        "preferred": [],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "pattern",
      "id": "pattern.feedback-recovery",
      "name": "Feedback and recovery",
      "version": "0.2.0",
      "status": "stable",
      "summary": "Chooses inline, global, or route-level feedback while preserving successful data and unfinished work.",
      "keywords": [
        "feedback",
        "and",
        "recovery",
        "feedback-recovery"
      ],
      "useWhen": [
        "A product needs the feedback and recovery pattern."
      ],
      "avoidWhen": [
        "A smaller primitive or a single component fully expresses the task."
      ],
      "components": [
        "ui.alert",
        "ui.feedback-provider",
        "ui.toast",
        "ui.empty-state",
        "ui.button"
      ],
      "anatomy": [
        "Failure boundary",
        "Preserved state statement",
        "Recovery action",
        "Request reference"
      ],
      "states": [
        "recoverable",
        "offline",
        "rate-limited",
        "critical",
        "recovered"
      ],
      "responsive": [
        "Keep inline feedback adjacent to its owning region.",
        "Place global toasts away from mobile navigation and safe areas."
      ],
      "flow": [
        "Classify the error.",
        "State what remains preserved.",
        "Offer one valid recovery action.",
        "Dismiss or reconcile after recovery."
      ],
      "stories": [],
      "accessibility": {
        "requirements": [
          "Preserve semantic reading and focus order.",
          "Represent loading, error, and empty states explicitly."
        ]
      },
      "examples": {
        "preferred": [],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "pattern",
      "id": "pattern.form-actions",
      "name": "Form actions",
      "version": "0.2.0",
      "status": "stable",
      "summary": "Orders validation, pending behavior, primary action, and cancellation for a form.",
      "keywords": [
        "form",
        "actions",
        "form-actions"
      ],
      "useWhen": [
        "A product needs the form actions pattern."
      ],
      "avoidWhen": [
        "A smaller primitive or a single component fully expresses the task."
      ],
      "components": [
        "ui.text-field",
        "ui.text-area",
        "ui.button",
        "ui.inline",
        "ui.stack",
        "ui.alert"
      ],
      "anatomy": [
        "Form fields",
        "Inline validation",
        "Form-level feedback",
        "Primary and secondary actions"
      ],
      "states": [
        "pristine",
        "dirty",
        "invalid",
        "submitting",
        "failed",
        "succeeded"
      ],
      "responsive": [
        "Stack actions on narrow screens when labels would wrap.",
        "Keep destructive actions separate from routine save actions."
      ],
      "flow": [
        "Validate fields.",
        "Move focus to the first invalid field.",
        "Submit once.",
        "Preserve input on failure."
      ],
      "stories": [],
      "accessibility": {
        "requirements": [
          "Preserve semantic reading and focus order.",
          "Represent loading, error, and empty states explicitly."
        ]
      },
      "examples": {
        "preferred": [],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "pattern",
      "id": "pattern.profile-surface",
      "name": "Profile surface",
      "version": "0.2.0",
      "status": "stable",
      "summary": "Combines profile identity, relationship action, tabs, and state-complete collections.",
      "keywords": [
        "profile",
        "surface",
        "profile-surface"
      ],
      "useWhen": [
        "A product needs the profile surface pattern."
      ],
      "avoidWhen": [
        "A smaller primitive or a single component fully expresses the task."
      ],
      "components": [
        "social.profile-header",
        "social.user-cell",
        "ui.tabs",
        "ui.empty-state",
        "ui.alert"
      ],
      "anatomy": [
        "Profile identity",
        "Primary relationship action",
        "Peer view tabs",
        "Collection region"
      ],
      "states": [
        "loading",
        "self",
        "other",
        "private",
        "blocked",
        "not-found"
      ],
      "responsive": [
        "Stack identity and actions on narrow screens.",
        "Keep the primary action visible without covering biography text."
      ],
      "flow": [
        "Load profile and relationship summary.",
        "Choose the correct action state.",
        "Render the selected collection."
      ],
      "stories": [],
      "accessibility": {
        "requirements": [
          "Preserve semantic reading and focus order.",
          "Represent loading, error, and empty states explicitly."
        ]
      },
      "examples": {
        "preferred": [],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "pattern",
      "id": "pattern.social-feed",
      "name": "Social feed",
      "version": "0.2.0",
      "status": "stable",
      "summary": "Composes a readable, state-complete social timeline without moving content unexpectedly.",
      "keywords": [
        "social",
        "feed",
        "social-feed"
      ],
      "useWhen": [
        "A product needs the social feed pattern."
      ],
      "avoidWhen": [
        "A smaller primitive or a single component fully expresses the task."
      ],
      "components": [
        "social.timeline-view",
        "social.post-card",
        "social.post-card-skeleton",
        "social.post-composer-view"
      ],
      "anatomy": [
        "Feed controls",
        "Composer",
        "New-item notice",
        "Timeline rows",
        "Pagination sentinel"
      ],
      "states": [
        "initial-loading",
        "populated",
        "empty",
        "loading-more",
        "load-more-error",
        "new-items-available"
      ],
      "responsive": [
        "Keep one reading column on narrow viewports.",
        "Do not insert new rows above the current viewport without user action."
      ],
      "flow": [
        "Load or restore a snapshot.",
        "Render stable rows.",
        "Poll or subscribe for new-item count.",
        "Accept new items and reset to a new snapshot."
      ],
      "stories": [],
      "accessibility": {
        "requirements": [
          "Preserve semantic reading and focus order.",
          "Represent loading, error, and empty states explicitly."
        ]
      },
      "examples": {
        "preferred": [],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "social.conversation-preview",
      "name": "ConversationPreview",
      "package": "@unpopping-candy/social",
      "version": "0.1.0",
      "status": "stable",
      "category": "messaging",
      "summary": "Presents a conversation summary with participants, latest message, time, and unread state.",
      "sourcePath": "packages/social/src/conversation/conversation-preview.tsx",
      "entrypoints": [
        "@unpopping-candy/social",
        "@unpopping-candy/social/conversation"
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
        "--popcandy-surface",
        "--popcandy-border",
        "--popcandy-ink-muted",
        "--popcandy-accent"
      ],
      "related": [
        "social.user-cell",
        "pattern.conversation-list"
      ],
      "stories": [
        "catalog-social-conversationpreview--contract"
      ],
      "accessibility": {
        "requirements": [
          "Unread state needs text or a labelled indicator.",
          "The preview needs a clear accessible name combining participant and latest message."
        ]
      },
      "props": [
        {
          "name": "conversation",
          "type": "SocialConversationPreviewViewModel",
          "required": true
        },
        {
          "name": "locale",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "nowMs",
          "type": "number | undefined",
          "required": false
        }
      ],
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
      },
      "nativeElement": "button"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "social.notification-item",
      "name": "NotificationItem",
      "package": "@unpopping-candy/social",
      "version": "0.1.0",
      "status": "stable",
      "category": "notification",
      "summary": "Presents one social notification with actor context, event description, and optional target content.",
      "sourcePath": "packages/social/src/notification/notification-item.tsx",
      "entrypoints": [
        "@unpopping-candy/social",
        "@unpopping-candy/social/notification"
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
        "--popcandy-surface",
        "--popcandy-border",
        "--popcandy-ink-muted"
      ],
      "related": [
        "ui.toast",
        "pattern.collection-states"
      ],
      "stories": [
        "catalog-social-notificationitem--contract"
      ],
      "accessibility": {
        "requirements": [
          "Unread state must be communicated beyond color.",
          "Event text should make sense without relying on iconography.",
          "The row needs one predictable activation target."
        ]
      },
      "props": [
        {
          "name": "locale",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "notification",
          "type": "SocialNotificationViewModel",
          "required": true
        },
        {
          "name": "nowMs",
          "type": "number | undefined",
          "required": false
        },
        {
          "name": "onSelect",
          "type": "(() => void) | undefined",
          "required": false
        }
      ],
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
      },
      "nativeElement": "element"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "social.post-actions",
      "name": "PostActions",
      "package": "@unpopping-candy/social",
      "version": "0.1.0",
      "status": "stable",
      "category": "post",
      "summary": "Presents reply, repost, like, bookmark, and share actions as controlled social interactions.",
      "sourcePath": "packages/social/src/post-card/post-actions.tsx",
      "entrypoints": [
        "@unpopping-candy/social",
        "@unpopping-candy/social/post"
      ],
      "keywords": [
        "post",
        "actions",
        "reply",
        "repost",
        "like",
        "bookmark"
      ],
      "useWhen": [
        "A post exposes standard engagement actions."
      ],
      "avoidWhen": [
        "A product has different action semantics; compose explicit Buttons instead."
      ],
      "tokens": [
        "--popcandy-ink-muted",
        "--popcandy-accent",
        "--popcandy-positive",
        "--popcandy-critical"
      ],
      "related": [
        "social.post-card",
        "ui.icon-button"
      ],
      "stories": [
        "catalog-social-postactions--contract"
      ],
      "accessibility": {
        "requirements": [
          "Each icon action needs an accessible label and pressed state.",
          "Pending state must prevent duplicate mutation without erasing current state."
        ]
      },
      "props": [
        {
          "name": "disabled",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "locale",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "metrics",
          "type": "SocialPostMetrics",
          "required": true
        },
        {
          "name": "onBookmark",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onLike",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onReply",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onRepost",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onShare",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "pendingAction",
          "type": "'like' | 'bookmark' | 'repost' | null | undefined",
          "required": false
        },
        {
          "name": "viewerState",
          "type": "SocialPostViewerState",
          "required": true
        }
      ],
      "variants": [
        {
          "name": "default",
          "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "compact",
          "guidance": "Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "idle",
        "liked",
        "reposted",
        "bookmarked",
        "pending"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Injected actions",
            "code": "<PostActions metrics={post.metrics} viewerState={post.viewerState} onLike={onLike} pendingAction={pending} />",
            "reason": "Keeps mutation ownership outside the component."
          }
        ],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "social.post-card",
      "name": "PostCard",
      "package": "@unpopping-candy/social",
      "version": "0.1.0",
      "status": "stable",
      "category": "post",
      "summary": "Presents a social post with author, content, distribution context, metrics, and injected actions.",
      "sourcePath": "packages/social/src/post-card/post-card.tsx",
      "entrypoints": [
        "@unpopping-candy/social",
        "@unpopping-candy/social/post"
      ],
      "keywords": [
        "post",
        "social",
        "content",
        "timeline"
      ],
      "useWhen": [
        "A timeline or thread needs a complete post presentation."
      ],
      "avoidWhen": [
        "The application needs to fetch or mutate post data inside the component.",
        "A compact reference is sufficient; use a post summary pattern."
      ],
      "tokens": [
        "--popcandy-surface",
        "--popcandy-border",
        "--popcandy-ink",
        "--popcandy-accent"
      ],
      "related": [
        "social.post-header",
        "social.post-actions",
        "social.post-media-grid",
        "pattern.social-feed"
      ],
      "stories": [
        "catalog-social-postcard--contract"
      ],
      "accessibility": {
        "requirements": [
          "The outer interactive region must not swallow nested action focus.",
          "Media requires alternative text.",
          "Metrics must have accessible labels, not numbers alone."
        ]
      },
      "props": [
        {
          "name": "compact",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "locale",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "nowMs",
          "type": "number | undefined",
          "required": false
        },
        {
          "name": "onBookmark",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onLike",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onOpenAuthor",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onOpenMedia",
          "type": "((mediaId: string) => void) | undefined",
          "required": false
        },
        {
          "name": "onOpenMenu",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onOpenPost",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onOpenQuotedPost",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onReply",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onRepost",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onShare",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "pendingAction",
          "type": "'like' | 'bookmark' | 'repost' | null | undefined",
          "required": false
        },
        {
          "name": "post",
          "type": "SocialPostViewModel",
          "required": true
        }
      ],
      "variants": [
        {
          "name": "timeline",
          "guidance": "Use the timeline variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "detail",
          "guidance": "Use the detail variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "quoted",
          "guidance": "Use the quoted variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default",
        "selected",
        "pending-action",
        "deleted"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Controlled post",
            "code": "<PostCard post={post} onLike={() => onLike(post.id)} onOpenPost={() => open(post.id)} />",
            "reason": "Keeps network and routing concerns in the consuming application."
          }
        ],
        "avoid": [
          {
            "title": "Fetching inside",
            "code": "function PostCard({ id }) { const post = useQuery(...); }",
            "reason": "Couples presentation to one data layer and prevents isolated use."
          }
        ]
      }
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "social.post-card-skeleton",
      "name": "PostCardSkeleton",
      "package": "@unpopping-candy/social",
      "version": "0.1.0",
      "status": "stable",
      "category": "loading",
      "summary": "Reserves the expected geometry of a PostCard while timeline data loads.",
      "sourcePath": "packages/social/src/post-card/post-card-skeleton.tsx",
      "entrypoints": [
        "@unpopping-candy/social",
        "@unpopping-candy/social/post"
      ],
      "keywords": [
        "post",
        "skeleton",
        "loading",
        "timeline"
      ],
      "useWhen": [
        "A timeline is loading its first page."
      ],
      "avoidWhen": [
        "Existing posts are available and only another page is loading."
      ],
      "tokens": [
        "--popcandy-surface-muted"
      ],
      "related": [
        "social.post-card",
        "ui.skeleton"
      ],
      "stories": [
        "catalog-social-postcardskeleton--contract"
      ],
      "accessibility": {
        "requirements": [
          "Mark the containing timeline region busy.",
          "Do not expose placeholder text as content."
        ]
      },
      "props": [],
      "variants": [
        {
          "name": "default",
          "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "loading"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Initial timeline",
            "code": "<PostCardSkeleton />",
            "reason": "Matches the post layout without fake content."
          }
        ],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "social.post-composer-view",
      "name": "PostComposerView",
      "package": "@unpopping-candy/social",
      "version": "0.1.0",
      "status": "stable",
      "category": "composer",
      "summary": "Presents a controlled social composer while the application owns draft, validation, upload, and publishing state.",
      "sourcePath": "packages/social/src/post-composer/post-composer-view.tsx",
      "entrypoints": [
        "@unpopping-candy/social",
        "@unpopping-candy/social/post"
      ],
      "keywords": [
        "composer",
        "post",
        "draft",
        "publish"
      ],
      "useWhen": [
        "A social product needs a reusable text-post composition surface."
      ],
      "avoidWhen": [
        "The component would need to own persistence, authentication, or uploads."
      ],
      "tokens": [
        "--popcandy-surface",
        "--popcandy-border",
        "--popcandy-accent",
        "--popcandy-field-height"
      ],
      "related": [
        "ui.text-area",
        "ui.button",
        "pattern.form-actions"
      ],
      "stories": [
        "catalog-social-postcomposerview--contract"
      ],
      "accessibility": {
        "requirements": [
          "The text field needs a clear label.",
          "Character limits and errors must be announced.",
          "Publishing must retain the draft until success."
        ]
      },
      "props": [
        {
          "name": "error",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "feedback",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "maximumLength",
          "type": "number | undefined",
          "required": false
        },
        {
          "name": "onAddEmoji",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onAddMedia",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onSubmit",
          "type": "() => void",
          "required": true
        },
        {
          "name": "onValueChange",
          "type": "(value: string) => void",
          "required": true
        },
        {
          "name": "pending",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "placeholder",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "submitLabel",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "value",
          "type": "string",
          "required": true
        },
        {
          "name": "viewer",
          "type": "SocialUserViewModel",
          "required": true
        }
      ],
      "variants": [
        {
          "name": "inline",
          "guidance": "Use the inline variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "dialog",
          "guidance": "Use the dialog variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "empty",
        "draft",
        "invalid",
        "publishing",
        "failed"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Controlled draft",
            "code": "<PostComposerView viewer={viewer} value={draft} onValueChange={setDraft} onSubmit={publish} pending={pending} />",
            "reason": "Leaves workflow state in the consuming app."
          }
        ],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "social.post-header",
      "name": "PostHeader",
      "package": "@unpopping-candy/social",
      "version": "0.1.0",
      "status": "stable",
      "category": "post",
      "summary": "Presents post identity, timestamp, and distribution context without owning navigation.",
      "sourcePath": "packages/social/src/post-card/post-header.tsx",
      "entrypoints": [
        "@unpopping-candy/social",
        "@unpopping-candy/social/post"
      ],
      "keywords": [
        "post",
        "author",
        "identity",
        "timestamp"
      ],
      "useWhen": [
        "A post or compact content item needs consistent identity metadata."
      ],
      "avoidWhen": [
        "A generic person row is needed; use UserCell."
      ],
      "tokens": [
        "--popcandy-ink",
        "--popcandy-ink-muted"
      ],
      "related": [
        "social.post-card",
        "social.user-cell"
      ],
      "stories": [
        "catalog-social-postheader--contract"
      ],
      "accessibility": {
        "requirements": [
          "Timestamp text should expose a meaningful date to assistive technology.",
          "Author navigation is supplied as a callback or link wrapper by the application."
        ]
      },
      "props": [
        {
          "name": "author",
          "type": "SocialUserViewModel",
          "required": true
        },
        {
          "name": "createdAt",
          "type": "string",
          "required": true
        },
        {
          "name": "locale",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "nowMs",
          "type": "number | undefined",
          "required": false
        },
        {
          "name": "onOpenAuthor",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onOpenMenu",
          "type": "(() => void) | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "default",
          "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "repost-context",
          "guidance": "Use the repost-context variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default",
        "verified"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Post identity",
            "code": "<PostHeader author={post.author} createdAt={post.createdAt} onOpenAuthor={openAuthor} />",
            "reason": "Injects navigation behavior."
          }
        ],
        "avoid": []
      }
    },
    {
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
        "catalog-social-postmediagrid--contract"
      ],
      "accessibility": {
        "requirements": [
          "Every image needs useful alt text or an explicit decorative alt.",
          "Buttons opening media need labels that identify the selected item."
        ]
      },
      "props": [
        {
          "name": "media",
          "type": "readonly SocialMediaViewModel[]",
          "required": true
        },
        {
          "name": "onOpenMedia",
          "type": "((mediaId: string) => void) | undefined",
          "required": false
        }
      ],
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
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "social.profile-header",
      "name": "ProfileHeader",
      "package": "@unpopping-candy/social",
      "version": "0.1.0",
      "status": "stable",
      "category": "profile",
      "summary": "Presents a curator or user profile summary with injected primary and secondary actions.",
      "sourcePath": "packages/social/src/profile/profile-header.tsx",
      "entrypoints": [
        "@unpopping-candy/social",
        "@unpopping-candy/social/profile"
      ],
      "keywords": [
        "profile",
        "header",
        "identity",
        "follow"
      ],
      "useWhen": [
        "A profile route needs consistent cover, identity, biography, and counts."
      ],
      "avoidWhen": [
        "A compact list row is sufficient; use UserCell."
      ],
      "tokens": [
        "--popcandy-surface",
        "--popcandy-border",
        "--popcandy-ink",
        "--popcandy-ink-muted"
      ],
      "related": [
        "social.user-cell",
        "pattern.profile-surface"
      ],
      "stories": [
        "catalog-social-profileheader--contract"
      ],
      "accessibility": {
        "requirements": [
          "Heading levels must fit the page hierarchy.",
          "Counts need complete accessible labels.",
          "Cover imagery must not hide identity text."
        ]
      },
      "props": [
        {
          "name": "locale",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "onOpenFollowers",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onOpenFollowing",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "primaryAction",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "profile",
          "type": "SocialProfileViewModel",
          "required": true
        }
      ],
      "variants": [
        {
          "name": "self",
          "guidance": "Use the self variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "other",
          "guidance": "Use the other variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "private",
          "guidance": "Use the private variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default",
        "following",
        "pending",
        "blocked"
      ],
      "examples": {
        "preferred": [
          {
            "title": "External relationship action",
            "code": "<ProfileHeader profile={profile} primaryAction={<FollowButton />} />",
            "reason": "Keeps relationship behavior in the application."
          }
        ],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "social.timeline-view",
      "name": "TimelineView",
      "package": "@unpopping-candy/social",
      "version": "0.1.0",
      "status": "stable",
      "category": "timeline",
      "summary": "Composes timeline states and rendered post rows without owning pagination or virtualization.",
      "sourcePath": "packages/social/src/timeline/timeline-view.tsx",
      "entrypoints": [
        "@unpopping-candy/social",
        "@unpopping-candy/social/timeline"
      ],
      "keywords": [
        "timeline",
        "feed",
        "list",
        "infinite-scroll"
      ],
      "useWhen": [
        "An application needs a consistent loading, empty, error, and populated timeline surface."
      ],
      "avoidWhen": [
        "The component would fetch pages itself.",
        "A static arbitrary list has no social semantics."
      ],
      "tokens": [
        "--popcandy-border",
        "--popcandy-surface"
      ],
      "related": [
        "social.post-card",
        "social.post-card-skeleton",
        "pattern.social-feed"
      ],
      "stories": [
        "catalog-social-timelineview--contract"
      ],
      "accessibility": {
        "requirements": [
          "Expose the list relationship with semantic list markup.",
          "Keep existing items when additional loading fails.",
          "Announce newly accepted items without moving focus."
        ]
      },
      "props": [
        {
          "name": "emptyDescription",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "emptyTitle",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "error",
          "type": "string | null | undefined",
          "required": false
        },
        {
          "name": "footer",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "loading",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "loadingMore",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "onRetry",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "posts",
          "type": "readonly SocialPostViewModel[]",
          "required": true
        },
        {
          "name": "renderPost",
          "type": "(post: SocialPostViewModel) => ReactNode",
          "required": false
        },
        {
          "name": "renderPostActions",
          "type": "(post: SocialPostViewModel) => Omit<PostCardProps, 'post'>",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "default",
          "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "initial-loading",
        "populated",
        "empty",
        "error",
        "loading-more"
      ],
      "examples": {
        "preferred": [
          {
            "title": "External pagination",
            "code": "<TimelineView posts={posts} renderPost={renderPost} loadingMore={isFetchingNextPage} />",
            "reason": "Keeps remote state outside presentation."
          }
        ],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "social.user-cell",
      "name": "UserCell",
      "package": "@unpopping-candy/social",
      "version": "0.1.0",
      "status": "stable",
      "category": "identity",
      "summary": "Presents a compact person row with optional supporting text and injected action.",
      "sourcePath": "packages/social/src/user-cell/user-cell.tsx",
      "entrypoints": [
        "@unpopping-candy/social",
        "@unpopping-candy/social/user"
      ],
      "keywords": [
        "user",
        "identity",
        "row",
        "follow",
        "search-result"
      ],
      "useWhen": [
        "Search, followers, recommendations, or membership lists show people."
      ],
      "avoidWhen": [
        "A full profile context is needed; use ProfileHeader."
      ],
      "tokens": [
        "--popcandy-ink",
        "--popcandy-ink-muted",
        "--popcandy-border"
      ],
      "related": [
        "ui.avatar",
        "social.profile-header"
      ],
      "stories": [
        "catalog-social-usercell--contract"
      ],
      "accessibility": {
        "requirements": [
          "If the entire row is interactive, preserve nested action behavior.",
          "Identity text must not be conveyed by avatar alone."
        ]
      },
      "props": [
        {
          "name": "actionLabel",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "actionPending",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "description",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "onAction",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "onSelect",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "user",
          "type": "SocialUserViewModel",
          "required": true
        }
      ],
      "variants": [
        {
          "name": "default",
          "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "compact",
          "guidance": "Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default",
        "selected",
        "pending"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Search result",
            "code": "<UserCell user={user} onSelect={openProfile} actionLabel=\"Follow\" onAction={followUser} />",
            "reason": "Separates row navigation and relationship action."
          }
        ],
        "avoid": []
      },
      "nativeElement": "div"
    },
    {
      "schemaVersion": 1,
      "kind": "template",
      "id": "template.fsd-social-shell",
      "name": "Strict FSD social shell",
      "version": "0.2.0",
      "status": "stable",
      "summary": "A React and Vite application shell that keeps Unpopping Candy presentation packages below FSD application slices.",
      "description": "A React and Vite application shell that keeps Unpopping Candy presentation packages below FSD application slices.",
      "keywords": [
        "strict",
        "fsd",
        "social",
        "shell",
        "template"
      ],
      "useWhen": [
        "A React and Vite application shell that keeps Unpopping Candy presentation packages below FSD application slices."
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
          "path": "src/app/providers/unpopping-candy-provider.tsx",
          "role": "Application provider composition",
          "source": "packages/registry/templates/fsd-social-shell/src/app/providers/unpopping-candy-provider.tsx"
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
    },
    {
      "schemaVersion": 1,
      "kind": "template",
      "id": "template.moderation-workspace",
      "name": "Moderation workspace",
      "version": "0.2.0",
      "status": "stable",
      "summary": "A three-region moderation decision workspace with queue, evidence, and controlled actions.",
      "description": "A three-region moderation decision workspace with queue, evidence, and controlled actions.",
      "keywords": [
        "moderation",
        "workspace",
        "template"
      ],
      "useWhen": [
        "A three-region moderation decision workspace with queue, evidence, and controlled actions."
      ],
      "avoidWhen": [
        "The target project uses a different framework or the requested surface is substantially smaller."
      ],
      "components": [
        "ui.container",
        "ui.surface",
        "ui.tabs",
        "ui.alert",
        "ui.button"
      ],
      "patterns": [
        "pattern.collection-states",
        "pattern.feedback-recovery"
      ],
      "files": [
        {
          "path": "src/moderation-workspace.tsx",
          "role": "Moderation workspace composition",
          "source": "packages/registry/templates/moderation-workspace/src/moderation-workspace.tsx"
        },
        {
          "path": "src/moderation-workspace.css",
          "role": "Responsive workspace layout",
          "source": "packages/registry/templates/moderation-workspace/src/moderation-workspace.css"
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
    },
    {
      "schemaVersion": 1,
      "kind": "template",
      "id": "template.profile-settings",
      "name": "Profile settings",
      "version": "0.2.0",
      "status": "stable",
      "summary": "A profile settings form with validation, pending state, and preserved failure feedback.",
      "description": "A profile settings form with validation, pending state, and preserved failure feedback.",
      "keywords": [
        "profile",
        "settings",
        "template"
      ],
      "useWhen": [
        "A profile settings form with validation, pending state, and preserved failure feedback."
      ],
      "avoidWhen": [
        "The target project uses a different framework or the requested surface is substantially smaller."
      ],
      "components": [
        "ui.text-field",
        "ui.text-area",
        "ui.button",
        "ui.alert"
      ],
      "patterns": [
        "pattern.form-actions",
        "pattern.feedback-recovery"
      ],
      "files": [
        {
          "path": "src/profile-settings.tsx",
          "role": "Settings form",
          "source": "packages/registry/templates/profile-settings/src/profile-settings.tsx"
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
    },
    {
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
    },
    {
      "schemaVersion": 1,
      "kind": "template",
      "id": "template.vite-app-shell",
      "name": "Vite app shell",
      "version": "0.2.0",
      "status": "stable",
      "summary": "A minimal React and Vite shell with Unpopping Candy theme and feedback providers.",
      "description": "A minimal React and Vite shell with Unpopping Candy theme and feedback providers.",
      "keywords": [
        "vite",
        "app",
        "shell",
        "template"
      ],
      "useWhen": [
        "A minimal React and Vite shell with Unpopping Candy theme and feedback providers."
      ],
      "avoidWhen": [
        "The target project uses a different framework or the requested surface is substantially smaller."
      ],
      "components": [
        "ui.container",
        "ui.feedback-provider",
        "ui.stack"
      ],
      "patterns": [
        "pattern.feedback-recovery"
      ],
      "files": [
        {
          "path": "src/app.tsx",
          "role": "Root application component",
          "source": "packages/registry/templates/vite-app-shell/src/app.tsx"
        },
        {
          "path": "src/main.tsx",
          "role": "Browser entry",
          "source": "packages/registry/templates/vite-app-shell/src/main.tsx"
        },
        {
          "path": "src/styles.css",
          "role": "Application-level styles",
          "source": "packages/registry/templates/vite-app-shell/src/styles.css"
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
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.alert",
      "name": "Alert",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "feedback",
      "summary": "Presents contextual feedback beside the task or content that produced it.",
      "sourcePath": "packages/ui/src/alert/alert.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/alert"
      ],
      "keywords": [
        "feedback",
        "error",
        "warning",
        "status",
        "callout"
      ],
      "useWhen": [
        "A message must remain visible until the user resolves or dismisses its cause.",
        "The message belongs to a specific form, panel, or data region."
      ],
      "avoidWhen": [
        "A short global confirmation is sufficient; use FeedbackProvider and Toast.",
        "The entire route is unusable; use a route-level error surface."
      ],
      "tokens": [
        "--popcandy-surface",
        "--popcandy-border",
        "--popcandy-positive",
        "--popcandy-warning",
        "--popcandy-critical"
      ],
      "related": [
        "ui.toast",
        "ui.empty-state",
        "pattern.feedback-recovery"
      ],
      "stories": [
        "catalog-ui-alert--contract"
      ],
      "accessibility": {
        "requirements": [
          "Use role=status for neutral and success feedback.",
          "Use role=alert for warning and critical feedback.",
          "Keep the title specific and state what remains preserved."
        ]
      },
      "props": [
        {
          "name": "action",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "description",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "dismissLabel",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "icon",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "metadata",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "onDismiss",
          "type": "(() => void) | undefined",
          "required": false
        },
        {
          "name": "title",
          "type": "ReactNode",
          "required": true
        },
        {
          "name": "tone",
          "type": "FeedbackTone | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "neutral",
          "guidance": "Use the neutral variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "success",
          "guidance": "Use the success variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "warning",
          "guidance": "Use the warning variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "critical",
          "guidance": "Use the critical variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default",
        "with-action",
        "dismissible"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Recoverable failure",
            "code": "<Alert tone=\"warning\" title=\"Could not refresh posts\">Existing posts remain available.</Alert>",
            "reason": "Names the failure and preserved state."
          }
        ],
        "avoid": [
          {
            "title": "Raw server error",
            "code": "<Alert title={error.message} />",
            "reason": "May expose unsafe or irrelevant implementation details."
          }
        ]
      },
      "nativeElement": "element"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.avatar",
      "name": "Avatar",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "identity",
      "summary": "Represents a person or organization with an image and deterministic fallback.",
      "sourcePath": "packages/ui/src/avatar/avatar.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/avatar"
      ],
      "keywords": [
        "avatar",
        "identity",
        "profile",
        "image",
        "initials"
      ],
      "useWhen": [
        "An identity must remain recognizable at compact sizes.",
        "A profile image may fail and needs a text fallback."
      ],
      "avoidWhen": [
        "The visual is decorative and has no identity meaning.",
        "A product or content thumbnail is being displayed."
      ],
      "tokens": [
        "--popcandy-surface-muted",
        "--popcandy-border",
        "--popcandy-ink"
      ],
      "related": [
        "social.user-cell"
      ],
      "stories": [
        "catalog-ui-avatar--contract"
      ],
      "accessibility": {
        "requirements": [
          "Provide a useful accessible label through surrounding identity text.",
          "Use an empty alt value when the adjacent text already names the person."
        ]
      },
      "props": [
        {
          "name": "alt",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "fallback",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "loading",
          "type": "'eager' | 'lazy' | undefined",
          "required": false
        },
        {
          "name": "size",
          "type": "'sm' | 'md' | 'lg' | 'xl' | undefined",
          "required": false
        },
        {
          "name": "src",
          "type": "string | null | undefined",
          "required": false
        }
      ],
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
        "image",
        "fallback",
        "loading"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Identity row",
            "code": "<Avatar src={user.avatarUrl} alt={user.displayName} fallback={user.initials} />",
            "reason": "Provides both image and fallback data."
          }
        ],
        "avoid": []
      },
      "nativeElement": "span"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.badge",
      "name": "Badge",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "data-display",
      "summary": "Displays a compact status or categorical label without becoming the primary action.",
      "sourcePath": "packages/ui/src/badge/badge.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/badge"
      ],
      "keywords": [
        "badge",
        "status",
        "label",
        "count"
      ],
      "useWhen": [
        "A short status, category, or count needs compact emphasis."
      ],
      "avoidWhen": [
        "The label is interactive; use Button, Tabs, or a link.",
        "The text is ordinary metadata and does not need a container."
      ],
      "tokens": [
        "--popcandy-surface-muted",
        "--popcandy-border",
        "--popcandy-ink-muted"
      ],
      "related": [
        "ui.alert"
      ],
      "stories": [
        "catalog-ui-badge--contract"
      ],
      "accessibility": {
        "requirements": [
          "Do not communicate state by color alone.",
          "Keep labels concise enough to remain readable at 200% zoom."
        ]
      },
      "props": [
        {
          "name": "size",
          "type": "'sm' | 'md' | undefined",
          "required": false
        },
        {
          "name": "tone",
          "type": "'neutral' | 'accent' | 'positive' | 'warning' | 'critical' | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "neutral",
          "guidance": "Use the neutral variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "accent",
          "guidance": "Use the accent variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "positive",
          "guidance": "Use the positive variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "warning",
          "guidance": "Use the warning variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "critical",
          "guidance": "Use the critical variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Status",
            "code": "<Badge tone=\"positive\">Published</Badge>",
            "reason": "Pairs text with semantic color."
          }
        ],
        "avoid": []
      },
      "nativeElement": "span"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.button",
      "name": "Button",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "action",
      "summary": "Triggers an immediate user action with explicit priority and pending behavior.",
      "sourcePath": "packages/ui/src/button/button.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/button"
      ],
      "keywords": [
        "button",
        "action",
        "submit",
        "confirm",
        "delete"
      ],
      "useWhen": [
        "The user can perform an immediate action.",
        "A decision region needs one clearly prioritized primary action."
      ],
      "avoidWhen": [
        "The target is navigation; use a link.",
        "The control only contains an icon; use IconButton."
      ],
      "tokens": [
        "--popcandy-button-height-md",
        "--popcandy-accent",
        "--popcandy-critical",
        "--popcandy-focus"
      ],
      "related": [
        "ui.icon-button",
        "pattern.form-actions"
      ],
      "stories": [
        "catalog-ui-button--contract"
      ],
      "accessibility": {
        "requirements": [
          "Use an action verb as the accessible name.",
          "Pending state must preserve the accessible name and disable duplicate submission.",
          "Use danger only for destructive actions with clear consequences."
        ]
      },
      "props": [
        {
          "name": "fullWidth",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "leadingIcon",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "pending",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "pendingLabel",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "size",
          "type": "ButtonSize | undefined",
          "required": false
        },
        {
          "name": "trailingIcon",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "variant",
          "type": "ButtonVariant | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "primary",
          "guidance": "Use the primary variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "secondary",
          "guidance": "Use the secondary variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "ghost",
          "guidance": "Use the ghost variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "danger",
          "guidance": "Use the danger variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default",
        "hover",
        "focus-visible",
        "disabled",
        "pending"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Primary action",
            "code": "<Button pending={isSaving}>Save changes</Button>",
            "reason": "One clear verb and stable pending state."
          }
        ],
        "avoid": [
          {
            "title": "Navigation",
            "code": "<Button onClick={() => navigate('/settings')}>Settings</Button>",
            "reason": "Navigation should preserve link semantics."
          }
        ]
      },
      "nativeElement": "button"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.container",
      "name": "Container",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "layout",
      "summary": "Constrains page content to a readable width and consistent horizontal gutter.",
      "sourcePath": "packages/ui/src/container/container.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/layout"
      ],
      "keywords": [
        "container",
        "layout",
        "width",
        "gutter"
      ],
      "useWhen": [
        "A page or section needs the standard Unpopping Candy reading width."
      ],
      "avoidWhen": [
        "The element must be full bleed.",
        "A local group only needs spacing; use Stack or Inline."
      ],
      "tokens": [
        "--popcandy-space-4",
        "--popcandy-space-6",
        "--popcandy-shell-max"
      ],
      "related": [
        "ui.stack",
        "ui.inline"
      ],
      "stories": [
        "catalog-ui-container--contract"
      ],
      "accessibility": {
        "requirements": [
          "Container must not prevent 320px reflow.",
          "Landmark semantics belong to the element passed through asChild or wrapping structure."
        ]
      },
      "props": [
        {
          "name": "size",
          "type": "'sm' | 'md' | 'lg' | 'full' | undefined",
          "required": false
        }
      ],
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
        },
        {
          "name": "full",
          "guidance": "Use the full variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Page shell",
            "code": "<Container size=\"lg\"><main>{children}</main></Container>",
            "reason": "Uses standard gutters and width."
          }
        ],
        "avoid": []
      },
      "nativeElement": "div"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.dialog",
      "name": "Dialog",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "overlay",
      "summary": "Interrupts the current context for a focused task that must be completed or dismissed.",
      "sourcePath": "packages/ui/src/dialog/dialog.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/dialog"
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
        "--popcandy-dialog-width-md",
        "--popcandy-surface",
        "--popcandy-shadow-dialog",
        "--popcandy-focus"
      ],
      "related": [
        "ui.button",
        "ui.alert"
      ],
      "stories": [
        "catalog-ui-dialog--contract"
      ],
      "accessibility": {
        "requirements": [
          "Move focus into the dialog on open and restore it on close.",
          "Provide a labelled title and optional description.",
          "Escape closes unless an irreversible operation is in progress."
        ]
      },
      "props": [
        {
          "name": "children",
          "type": "ReactNode",
          "required": true
        },
        {
          "name": "className",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "closeLabel",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "defaultOpen",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "description",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "dismissible",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "footer",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "onOpenChange",
          "type": "((open: boolean) => void) | undefined",
          "required": false
        },
        {
          "name": "open",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "size",
          "type": "'sm' | 'md' | 'lg' | undefined",
          "required": false
        },
        {
          "name": "title",
          "type": "ReactNode",
          "required": true
        }
      ],
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
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.empty-state",
      "name": "EmptyState",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "feedback",
      "summary": "Explains why a meaningful region has no content and offers the next valid action.",
      "sourcePath": "packages/ui/src/empty-state/empty-state.tsx",
      "entrypoints": [
        "@unpopping-candy/ui"
      ],
      "keywords": [
        "empty",
        "zero-state",
        "no-results",
        "onboarding"
      ],
      "useWhen": [
        "A list, search, or workspace has no content."
      ],
      "avoidWhen": [
        "Data is still loading; use Skeleton.",
        "The region failed to load; use Alert."
      ],
      "tokens": [
        "--popcandy-ink",
        "--popcandy-ink-muted",
        "--popcandy-space-8"
      ],
      "related": [
        "ui.alert",
        "ui.skeleton"
      ],
      "stories": [
        "catalog-ui-emptystate--contract"
      ],
      "accessibility": {
        "requirements": [
          "Use a heading that identifies the empty condition.",
          "Do not imply failure when the empty state is valid."
        ]
      },
      "props": [
        {
          "name": "action",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "description",
          "type": "ReactNode",
          "required": true
        },
        {
          "name": "headingLevel",
          "type": "2 | 3 | 4 | undefined",
          "required": false
        },
        {
          "name": "icon",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "title",
          "type": "ReactNode",
          "required": true
        }
      ],
      "variants": [
        {
          "name": "compact",
          "guidance": "Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "default",
          "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "first-use",
        "no-results",
        "cleared"
      ],
      "examples": {
        "preferred": [
          {
            "title": "No results",
            "code": "<EmptyState title=\"No matching curators\" description=\"Try a broader search.\" />",
            "reason": "Explains the condition and recovery."
          }
        ],
        "avoid": []
      },
      "nativeElement": "element"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.feedback-provider",
      "name": "FeedbackProvider",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "feedback",
      "summary": "Owns the application-level transient feedback queue and exposes a bounded controller.",
      "sourcePath": "packages/ui/src/feedback/feedback-provider.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/feedback"
      ],
      "keywords": [
        "toast",
        "feedback",
        "provider",
        "queue"
      ],
      "useWhen": [
        "An application needs global confirmations and non-blocking errors."
      ],
      "avoidWhen": [
        "Feedback belongs permanently beside a field or panel; use Alert."
      ],
      "tokens": [
        "--popcandy-dialog-width-sm",
        "--popcandy-shadow-dialog"
      ],
      "related": [
        "ui.toast",
        "ui.toast-viewport",
        "ui.alert"
      ],
      "stories": [
        "catalog-ui-feedbackprovider--contract"
      ],
      "accessibility": {
        "requirements": [
          "Mount one provider per feedback scope.",
          "Critical items remain until explicitly dismissed.",
          "Do not enqueue raw server messages."
        ]
      },
      "props": [
        {
          "name": "children",
          "type": "ReactNode",
          "required": true
        },
        {
          "name": "maximumVisible",
          "type": "number | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "default",
          "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "idle",
        "queued",
        "announcing"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Application provider",
            "code": "<FeedbackProvider><App /></FeedbackProvider>",
            "reason": "Creates one deterministic queue."
          }
        ],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.icon-button",
      "name": "IconButton",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "action",
      "summary": "Triggers a frequent action where a well-known icon can replace visible text.",
      "sourcePath": "packages/ui/src/icon-button/icon-button.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/button"
      ],
      "keywords": [
        "icon",
        "button",
        "toolbar",
        "compact-action"
      ],
      "useWhen": [
        "A compact toolbar or repeated row action has a familiar icon."
      ],
      "avoidWhen": [
        "The action is unfamiliar or consequential; use a labeled Button.",
        "The icon is decorative."
      ],
      "tokens": [
        "--popcandy-button-height-md",
        "--popcandy-focus",
        "--popcandy-ink-muted"
      ],
      "related": [
        "ui.button"
      ],
      "stories": [
        "catalog-ui-iconbutton--contract"
      ],
      "accessibility": {
        "requirements": [
          "An aria-label is required.",
          "Tooltip text should match the accessible name.",
          "Pressed toggles must expose aria-pressed."
        ]
      },
      "props": [
        {
          "name": "icon",
          "type": "ReactNode",
          "required": true
        },
        {
          "name": "label",
          "type": "string",
          "required": true
        },
        {
          "name": "selected",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "size",
          "type": "'sm' | 'md' | 'lg' | undefined",
          "required": false
        },
        {
          "name": "tone",
          "type": "'neutral' | 'accent' | 'danger' | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "ghost",
          "guidance": "Use the ghost variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "secondary",
          "guidance": "Use the secondary variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "danger",
          "guidance": "Use the danger variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default",
        "hover",
        "focus-visible",
        "disabled",
        "pressed"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Toolbar action",
            "code": "<IconButton label=\"Bookmark post\" icon={<BookmarkIcon />} />",
            "reason": "Provides a stable accessible name."
          }
        ],
        "avoid": [
          {
            "title": "Unnamed icon",
            "code": "<IconButton><BookmarkIcon /></IconButton>",
            "reason": "Screen-reader users cannot identify the action."
          }
        ]
      },
      "nativeElement": "button"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.inline",
      "name": "Inline",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "layout",
      "summary": "Arranges related items horizontally with tokenized gap, alignment, and wrapping.",
      "sourcePath": "packages/ui/src/inline/inline.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/layout"
      ],
      "keywords": [
        "inline",
        "row",
        "layout",
        "gap",
        "wrap"
      ],
      "useWhen": [
        "Actions, metadata, or compact controls form one horizontal group."
      ],
      "avoidWhen": [
        "Items represent a vertical reading sequence; use Stack."
      ],
      "tokens": [
        "--popcandy-space-1",
        "--popcandy-space-2",
        "--popcandy-space-3",
        "--popcandy-space-4"
      ],
      "related": [
        "ui.stack",
        "ui.separator"
      ],
      "stories": [
        "catalog-ui-inline--contract"
      ],
      "accessibility": {
        "requirements": [
          "Allow wrapping when labels may grow or localize.",
          "Preserve a logical DOM order."
        ]
      },
      "props": [
        {
          "name": "align",
          "type": "CSSProperties['alignItems']",
          "required": false
        },
        {
          "name": "gap",
          "type": "0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | undefined",
          "required": false
        },
        {
          "name": "justify",
          "type": "CSSProperties['justifyContent']",
          "required": false
        },
        {
          "name": "wrap",
          "type": "boolean | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "start",
          "guidance": "Use the start variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "center",
          "guidance": "Use the center variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "end",
          "guidance": "Use the end variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "space-between",
          "guidance": "Use the space-between variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "nowrap",
        "wrap"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Action row",
            "code": "<Inline gap={3}><Button>Save</Button><Button variant=\"secondary\">Cancel</Button></Inline>",
            "reason": "Groups related actions without arbitrary margins."
          }
        ],
        "avoid": []
      },
      "nativeElement": "div"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.separator",
      "name": "Separator",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "layout",
      "summary": "Separates adjacent regions when spacing alone cannot communicate the boundary.",
      "sourcePath": "packages/ui/src/separator/separator.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/layout"
      ],
      "keywords": [
        "separator",
        "divider",
        "rule"
      ],
      "useWhen": [
        "Two peer regions need a visible boundary."
      ],
      "avoidWhen": [
        "The rule is decorative only and adds visual noise."
      ],
      "tokens": [
        "--popcandy-border"
      ],
      "related": [
        "ui.stack",
        "ui.surface"
      ],
      "stories": [
        "catalog-ui-separator--contract"
      ],
      "accessibility": {
        "requirements": [
          "Use semantic hr behavior for meaningful thematic breaks.",
          "Hide purely decorative separators from assistive technology."
        ]
      },
      "props": [
        {
          "name": "orientation",
          "type": "'horizontal' | 'vertical' | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "horizontal",
          "guidance": "Use the horizontal variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "vertical",
          "guidance": "Use the vertical variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Section boundary",
            "code": "<Separator />",
            "reason": "Uses the shared border token."
          }
        ],
        "avoid": []
      },
      "nativeElement": "hr"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.skeleton",
      "name": "Skeleton",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "loading",
      "summary": "Reserves stable geometry while content is loading.",
      "sourcePath": "packages/ui/src/skeleton/skeleton.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/loading"
      ],
      "keywords": [
        "skeleton",
        "loading",
        "placeholder"
      ],
      "useWhen": [
        "The final content shape is predictable and load time is perceptible."
      ],
      "avoidWhen": [
        "The operation is immediate or the layout is unknown; use Spinner or a simple pending label."
      ],
      "tokens": [
        "--popcandy-surface-muted",
        "--popcandy-motion-slow"
      ],
      "related": [
        "ui.spinner",
        "ui.empty-state"
      ],
      "stories": [
        "catalog-ui-skeleton--contract"
      ],
      "accessibility": {
        "requirements": [
          "Mark the containing region busy.",
          "Skeleton elements themselves should be hidden from assistive technology.",
          "Respect reduced motion."
        ]
      },
      "props": [
        {
          "name": "height",
          "type": "CSSProperties['height']",
          "required": false
        },
        {
          "name": "radius",
          "type": "CSSProperties['borderRadius']",
          "required": false
        },
        {
          "name": "width",
          "type": "CSSProperties['width']",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "text",
          "guidance": "Use the text variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "circle",
          "guidance": "Use the circle variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "block",
          "guidance": "Use the block variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "loading"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Timeline row",
            "code": "<Skeleton aria-hidden style={{ height: 160 }} />",
            "reason": "Reserves layout without announcing fake content."
          }
        ],
        "avoid": []
      },
      "nativeElement": "span"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.spinner",
      "name": "Spinner",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "loading",
      "summary": "Indicates an indeterminate operation in a compact region.",
      "sourcePath": "packages/ui/src/spinner/spinner.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/loading"
      ],
      "keywords": [
        "spinner",
        "loading",
        "progress",
        "pending"
      ],
      "useWhen": [
        "A control or small region is waiting and final geometry is unknown."
      ],
      "avoidWhen": [
        "A full content layout can be represented with Skeleton.",
        "Progress is measurable; use a determinate progress indicator."
      ],
      "tokens": [
        "--popcandy-accent",
        "--popcandy-motion-fast"
      ],
      "related": [
        "ui.skeleton",
        "ui.button"
      ],
      "stories": [
        "catalog-ui-spinner--contract"
      ],
      "accessibility": {
        "requirements": [
          "Provide a visible or visually hidden loading label.",
          "Respect reduced motion without removing the state indication."
        ]
      },
      "props": [
        {
          "name": "label",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "size",
          "type": "'sm' | 'md' | 'lg' | undefined",
          "required": false
        }
      ],
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
        "active"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Pending control",
            "code": "<Spinner label=\"Saving changes\" />",
            "reason": "Announces the current operation."
          }
        ],
        "avoid": []
      },
      "nativeElement": "span"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.stack",
      "name": "Stack",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "layout",
      "summary": "Arranges a vertical reading or task sequence with tokenized spacing.",
      "sourcePath": "packages/ui/src/stack/stack.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/layout"
      ],
      "keywords": [
        "stack",
        "column",
        "layout",
        "gap"
      ],
      "useWhen": [
        "Content forms a vertical hierarchy or workflow."
      ],
      "avoidWhen": [
        "Items form a compact horizontal group; use Inline."
      ],
      "tokens": [
        "--popcandy-space-1",
        "--popcandy-space-2",
        "--popcandy-space-3",
        "--popcandy-space-4",
        "--popcandy-space-6"
      ],
      "related": [
        "ui.inline",
        "ui.container"
      ],
      "stories": [
        "catalog-ui-stack--contract"
      ],
      "accessibility": {
        "requirements": [
          "Do not change semantic order for visual layout.",
          "Use responsive gaps rather than arbitrary child margins."
        ]
      },
      "props": [
        {
          "name": "align",
          "type": "CSSProperties['alignItems']",
          "required": false
        },
        {
          "name": "gap",
          "type": "0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "xs",
          "guidance": "Use the xs variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
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
        },
        {
          "name": "xl",
          "guidance": "Use the xl variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Form layout",
            "code": "<Stack gap={4}><TextField label=\"Name\" /><TextArea label=\"Biography\" /></Stack>",
            "reason": "Creates consistent vertical rhythm."
          }
        ],
        "avoid": []
      },
      "nativeElement": "div"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.surface",
      "name": "Surface",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "layout",
      "summary": "Creates a semantic background and boundary without prescribing product content.",
      "sourcePath": "packages/ui/src/surface/surface.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/layout"
      ],
      "keywords": [
        "surface",
        "panel",
        "card",
        "background"
      ],
      "useWhen": [
        "A local region needs contrast, padding, or elevation."
      ],
      "avoidWhen": [
        "Every item in a feed would become a nested card.",
        "Whitespace and a divider communicate the boundary better."
      ],
      "tokens": [
        "--popcandy-surface",
        "--popcandy-surface-muted",
        "--popcandy-border",
        "--popcandy-shadow-dialog"
      ],
      "related": [
        "ui.container",
        "ui.separator"
      ],
      "stories": [
        "catalog-ui-surface--contract"
      ],
      "accessibility": {
        "requirements": [
          "Interactive surfaces must use a semantic interactive element.",
          "Do not rely on elevation alone for grouping."
        ]
      },
      "props": [
        {
          "name": "border",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "padding",
          "type": "'none' | 'sm' | 'md' | 'lg' | undefined",
          "required": false
        },
        {
          "name": "tone",
          "type": "'base' | 'muted' | 'raised' | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "plain",
          "guidance": "Use the plain variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "subtle",
          "guidance": "Use the subtle variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "raised",
          "guidance": "Use the raised variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default",
        "interactive"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Settings section",
            "code": "<Surface tone=\"muted\"><Stack>...</Stack></Surface>",
            "reason": "Adds bounded contrast to a local region."
          }
        ],
        "avoid": []
      },
      "nativeElement": "div"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.tabs",
      "name": "Tabs",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "navigation",
      "summary": "Switches among peer views that share one context and URL or controlled state.",
      "sourcePath": "packages/ui/src/tabs/tabs.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/tabs"
      ],
      "keywords": [
        "tabs",
        "navigation",
        "view-switcher",
        "selection"
      ],
      "useWhen": [
        "A region has a small set of mutually exclusive peer views."
      ],
      "avoidWhen": [
        "The choices submit form data; use RadioGroup.",
        "The targets are unrelated pages in global navigation."
      ],
      "tokens": [
        "--popcandy-accent",
        "--popcandy-border",
        "--popcandy-focus"
      ],
      "related": [
        "ui.button"
      ],
      "stories": [
        "catalog-ui-tabs--contract"
      ],
      "accessibility": {
        "requirements": [
          "Use tablist, tab, and tabpanel semantics.",
          "Support arrow-key movement and stable focus.",
          "Reflect restorable view state in the URL when appropriate."
        ]
      },
      "props": [
        {
          "name": "activationMode",
          "type": "'automatic' | 'manual' | undefined",
          "required": false
        },
        {
          "name": "ariaLabel",
          "type": "string",
          "required": true
        },
        {
          "name": "className",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "defaultValue",
          "type": "TValue | undefined",
          "required": false
        },
        {
          "name": "items",
          "type": "readonly TabItem<TValue>[]",
          "required": true
        },
        {
          "name": "onValueChange",
          "type": "((value: TValue) => void) | undefined",
          "required": false
        },
        {
          "name": "orientation",
          "type": "'horizontal' | 'vertical' | undefined",
          "required": false
        },
        {
          "name": "value",
          "type": "TValue | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "line",
          "guidance": "Use the line variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "compact",
          "guidance": "Use the compact variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default",
        "selected",
        "focus-visible",
        "disabled"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Profile views",
            "code": "<Tabs ariaLabel=\"Profile views\" value={tab} onValueChange={setTab} items={items} />",
            "reason": "Keeps selection controlled and explicit."
          }
        ],
        "avoid": []
      }
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.text-area",
      "name": "TextArea",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "form",
      "summary": "Collects multi-line text with label, description, validation, and native textarea semantics.",
      "sourcePath": "packages/ui/src/text-area/text-area.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/forms"
      ],
      "keywords": [
        "textarea",
        "form",
        "multiline",
        "input"
      ],
      "useWhen": [
        "The user writes more than one short line."
      ],
      "avoidWhen": [
        "The value is a single concise field; use TextField.",
        "Rich text structure is required."
      ],
      "tokens": [
        "--popcandy-field-height",
        "--popcandy-border",
        "--popcandy-focus",
        "--popcandy-critical"
      ],
      "related": [
        "ui.text-field",
        "pattern.form-actions"
      ],
      "stories": [
        "catalog-ui-textarea--contract"
      ],
      "accessibility": {
        "requirements": [
          "Every field requires a visible label or an equivalent accessible name.",
          "Connect descriptions and errors with aria-describedby.",
          "Expose aria-invalid when validation fails."
        ]
      },
      "props": [
        {
          "name": "counter",
          "type": "{ current: number; maximum: number } | undefined",
          "required": false
        },
        {
          "name": "description",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "error",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "hideLabel",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "label",
          "type": "string",
          "required": true
        }
      ],
      "variants": [
        {
          "name": "default",
          "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "empty",
        "filled",
        "focus",
        "disabled",
        "invalid"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Biography",
            "code": "<TextArea label=\"Biography\" error={errors.bio} />",
            "reason": "Associates label and validation feedback."
          }
        ],
        "avoid": []
      },
      "nativeElement": "textarea"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.text-field",
      "name": "TextField",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "form",
      "summary": "Collects one short value with label, description, validation, and native input semantics.",
      "sourcePath": "packages/ui/src/text-field/text-field.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/forms"
      ],
      "keywords": [
        "input",
        "form",
        "text-field",
        "search"
      ],
      "useWhen": [
        "The user enters a concise value such as a name, email, or query."
      ],
      "avoidWhen": [
        "Multi-line input is expected; use TextArea.",
        "A fixed choice set is known; use a selection control."
      ],
      "tokens": [
        "--popcandy-field-height",
        "--popcandy-border",
        "--popcandy-focus",
        "--popcandy-critical"
      ],
      "related": [
        "ui.text-area",
        "pattern.form-actions"
      ],
      "stories": [
        "catalog-ui-textfield--contract"
      ],
      "accessibility": {
        "requirements": [
          "Every field requires a visible label or equivalent accessible name.",
          "Connect descriptions and errors with aria-describedby.",
          "Use an appropriate autocomplete value for personal data."
        ]
      },
      "props": [
        {
          "name": "description",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "error",
          "type": "string | undefined",
          "required": false
        },
        {
          "name": "hideLabel",
          "type": "boolean | undefined",
          "required": false
        },
        {
          "name": "label",
          "type": "string",
          "required": true
        },
        {
          "name": "leadingIcon",
          "type": "ReactNode | undefined",
          "required": false
        },
        {
          "name": "trailingElement",
          "type": "ReactNode | undefined",
          "required": false
        }
      ],
      "variants": [
        {
          "name": "text",
          "guidance": "Use the text variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "email",
          "guidance": "Use the email variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "password",
          "guidance": "Use the password variant only when its semantic role matches the surrounding decision or content hierarchy."
        },
        {
          "name": "search",
          "guidance": "Use the search variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "empty",
        "filled",
        "focus",
        "disabled",
        "invalid"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Email",
            "code": "<TextField label=\"Email\" type=\"email\" autoComplete=\"email\" />",
            "reason": "Uses native semantics and autofill metadata."
          }
        ],
        "avoid": []
      },
      "nativeElement": "input"
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.toast",
      "name": "Toast",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "feedback",
      "summary": "Renders one transient or persistent item from the feedback queue.",
      "sourcePath": "packages/ui/src/feedback/toast.tsx",
      "entrypoints": [
        "@unpopping-candy/ui",
        "@unpopping-candy/ui/feedback"
      ],
      "keywords": [
        "toast",
        "notification",
        "confirmation",
        "global-feedback"
      ],
      "useWhen": [
        "A result is global and does not require a fixed page position."
      ],
      "avoidWhen": [
        "The message must remain beside its source; use Alert."
      ],
      "tokens": [
        "--popcandy-surface",
        "--popcandy-shadow-dialog",
        "--popcandy-positive",
        "--popcandy-warning",
        "--popcandy-critical"
      ],
      "related": [
        "ui.feedback-provider",
        "ui.toast-viewport"
      ],
      "stories": [
        "catalog-ui-toast--contract"
      ],
      "accessibility": {
        "requirements": [
          "Neutral and success use polite live regions.",
          "Warning and critical use assertive announcements.",
          "Actions need clear labels and keyboard focus."
        ]
      },
      "props": [
        {
          "name": "item",
          "type": "FeedbackItem",
          "required": true
        },
        {
          "name": "onDismiss",
          "type": "(id: string) => void",
          "required": true
        }
      ],
      "variants": [
        {
          "name": "neutral",
          "guidance": "Use for non-semantic information."
        },
        {
          "name": "success",
          "guidance": "Use after an operation has completed."
        },
        {
          "name": "warning",
          "guidance": "Use for recoverable failure or degraded state."
        },
        {
          "name": "critical",
          "guidance": "Use for security, session, or unrecoverable failure."
        }
      ],
      "states": [
        "entering",
        "visible",
        "leaving",
        "repeated"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Global confirmation",
            "code": "feedback.show({ tone: 'success', title: 'Link copied' })",
            "reason": "Communicates a short global result."
          }
        ],
        "avoid": []
      }
    },
    {
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
      "props": [
        {
          "name": "items",
          "type": "readonly FeedbackItem[]",
          "required": true
        },
        {
          "name": "onDismiss",
          "type": "(id: string) => void",
          "required": true
        }
      ],
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
    },
    {
      "schemaVersion": 1,
      "kind": "component",
      "id": "ui.visually-hidden",
      "name": "VisuallyHidden",
      "package": "@unpopping-candy/ui",
      "version": "0.1.0",
      "status": "stable",
      "category": "accessibility",
      "summary": "Keeps essential text available to assistive technology without changing visual layout.",
      "sourcePath": "packages/ui/src/visually-hidden/visually-hidden.tsx",
      "entrypoints": [
        "@unpopping-candy/ui"
      ],
      "keywords": [
        "accessibility",
        "screen-reader",
        "hidden-label"
      ],
      "useWhen": [
        "An icon-only control or visual pattern needs an accessible text equivalent."
      ],
      "avoidWhen": [
        "Content should be hidden from everyone; do not render it.",
        "Visible instructions would benefit all users."
      ],
      "tokens": [
        "--popcandy-space-0"
      ],
      "related": [
        "ui.icon-button",
        "ui.spinner"
      ],
      "stories": [
        "catalog-ui-visuallyhidden--contract"
      ],
      "accessibility": {
        "requirements": [
          "Hidden text must remain in the accessibility tree.",
          "Do not use it to conceal focusable controls."
        ]
      },
      "props": [],
      "variants": [
        {
          "name": "default",
          "guidance": "Use the default variant only when its semantic role matches the surrounding decision or content hierarchy."
        }
      ],
      "states": [
        "default"
      ],
      "examples": {
        "preferred": [
          {
            "title": "Loading name",
            "code": "<Spinner><VisuallyHidden>Loading posts</VisuallyHidden></Spinner>",
            "reason": "Retains an accessible name."
          }
        ],
        "avoid": []
      },
      "nativeElement": "span"
    }
  ]
} as const satisfies KnowledgeCatalog;
