---
schema: "https://designmd.org/spec/0.1"
version: "0.2.0"
name: "Unpopping Candy"
description: "AI-operable React design system for content-rich, social, editorial, and community products."
sourceOfTruth: "agent/manifests/catalog.json"
generated: true
colors:
  canvas: "{color.reference.neutral50}"
  surface: "{color.reference.neutral0}"
  text: "{color.reference.neutral950}"
  textMuted: "{color.reference.neutral600}"
  border: "{color.reference.neutral200}"
  action: "{color.reference.blue500}"
  positive: "{color.reference.green600}"
  warning: "{color.reference.amber700}"
  critical: "{color.reference.red600}"
typography:
  ui: "Inter, Pretendard, IBM Plex Sans KR, system-ui, sans-serif"
  mono: "IBM Plex Mono, SFMono-Regular, Consolas, monospace"
density:
  default: "comfortable"
  supported: ["comfortable", "compact"]
themes: ["light", "dark", "system", "high-contrast"]
packages:
  - "@unpopping-candy/tokens"
  - "@unpopping-candy/theme"
  - "@unpopping-candy/icons"
  - "@unpopping-candy/ui"
  - "@unpopping-candy/social"
  - "@unpopping-candy/knowledge"
  - "@unpopping-candy/registry"
  - "@unpopping-candy/cli"
  - "@unpopping-candy/mcp"
stableComponents: 32
---

# Unpopping Candy Design Contract

Unpopping Candy is a reusable React design system for content-rich, social, editorial, and community products. This file is generated from component-adjacent metadata and token manifests. Do not edit generated sections by hand; update the canonical `*.docs.ts` entry and run `npm run agent:generate`.

## Agent operating contract

1. Detect the project and installed Unpopping Candy versions before generating code.
2. Search existing components, patterns, and templates before inventing a new surface.
3. Import only documented public entrypoints; never import `src` or package internals.
4. Keep remote state, routing, authentication, and application workflow outside visual packages.
5. Use Unpopping Candy tokens instead of hardcoded color, spacing, radius, shadow, or motion values.
6. Cover loading, empty, populated, error, disabled, pending, and responsive states when they apply.
7. Generate or update a Storybook story and run accessibility and interaction checks.
8. Run `popcandy validate` before presenting the result.

## System promise

- Content leads; chrome recedes.
- Every interactive state is keyboard reachable and visibly focused.
- Feedback explains what changed, what was preserved, and what the user can do next.
- Components are controlled by consumer data and callbacks; they do not fetch.
- Themes are CSS-variable contracts, not hidden runtime styling.
- Social patterns express product concepts but never import an API DTO, router, cache, auth runtime, or application slice.

## Visual language

- Use neutral canvas and surfaces; authored content supplies most color.
- Use one restrained accent role for actions and selection.
- Prefer borders and spacing to decorative shadows.
- Radius is functional, not ornamental.
- Reserve positive, warning, and critical colors for real state.
- Avoid ornamental gradients, glass effects, fake metrics, decorative pills, and nested card grids.
- Use typography and whitespace to establish hierarchy before adding containers.

## Package boundaries

| Package | Responsibility | Must not own |
|---|---|---|
| `@unpopping-candy/tokens` | Reference, semantic, and component tokens | React state or product behavior |
| `@unpopping-candy/theme` | Theme, density, accent, and scope | Product data |
| `@unpopping-candy/icons` | Semantic icon names backed by Ant Design Icons | Product-specific actions |
| `@unpopping-candy/ui` | Product-independent accessible components | Network, router, cache, auth |
| `@unpopping-candy/social` | API-independent social presentation models and patterns | Fetching, mutations, application state |
| `@unpopping-candy/knowledge` | Deterministic catalog, compatibility, and document generators | Rendering, filesystem writes, or product state |
| `@unpopping-candy/registry` | Checksum-verified local template planning and guarded writes | Network fetching or application behavior |
| `@unpopping-candy/cli` | Installed-version discovery, composition, validation, and scaffolding | Component rendering or hosted services |
| `@unpopping-candy/mcp` | Local stdio adapter over knowledge, CLI, Registry, and tokens | LLM calls or a duplicate catalog |

Authentication, server state, Feature-Sliced Design application code, API clients, and backend services belong to the separate application kit.

## Foundations

### Color

Use semantic variables such as `--popcandy-canvas`, `--popcandy-surface`, `--popcandy-ink`, `--popcandy-border`, `--popcandy-accent`, `--popcandy-positive`, `--popcandy-warning`, and `--popcandy-critical`. Reference colors are implementation inputs; product code should normally consume semantic roles.

### Typography

Use the sans stack for interface and content text. Use the mono stack only for identifiers, request references, code, and machine-oriented values. Keep labels explicit and readable at 200% zoom.

### Spacing and layout

Use the `--popcandy-space-*` scale and the Stack, Inline, Container, Surface, and Separator primitives. Do not create arbitrary one-off margins when a composition primitive expresses the relationship.

### Motion

Use `--popcandy-motion-fast`, `--popcandy-motion-normal`, and `--popcandy-motion-slow` with the shared easing variables. Motion explains state change; it must not delay task completion and must respect reduced-motion preferences.

## Stable components

| Component | Package | Category | Summary |
|---|---|---|---|
| [ConversationPreview](./agent/components/social.conversation-preview.md) | `@unpopping-candy/social` | messaging | Presents a conversation summary with participants, latest message, time, and unread state. |
| [NotificationItem](./agent/components/social.notification-item.md) | `@unpopping-candy/social` | notification | Presents one social notification with actor context, event description, and optional target content. |
| [PostActions](./agent/components/social.post-actions.md) | `@unpopping-candy/social` | post | Presents reply, repost, like, bookmark, and share actions as controlled social interactions. |
| [PostCard](./agent/components/social.post-card.md) | `@unpopping-candy/social` | post | Presents a social post with author, content, distribution context, metrics, and injected actions. |
| [PostCardSkeleton](./agent/components/social.post-card-skeleton.md) | `@unpopping-candy/social` | loading | Reserves the expected geometry of a PostCard while timeline data loads. |
| [PostComposerView](./agent/components/social.post-composer-view.md) | `@unpopping-candy/social` | composer | Presents a controlled social composer while the application owns draft, validation, upload, and publishing state. |
| [PostHeader](./agent/components/social.post-header.md) | `@unpopping-candy/social` | post | Presents post identity, timestamp, and distribution context without owning navigation. |
| [PostMediaGrid](./agent/components/social.post-media-grid.md) | `@unpopping-candy/social` | media | Arranges one to four social media assets with stable aspect ratios and selection callbacks. |
| [ProfileHeader](./agent/components/social.profile-header.md) | `@unpopping-candy/social` | profile | Presents a curator or user profile summary with injected primary and secondary actions. |
| [TimelineView](./agent/components/social.timeline-view.md) | `@unpopping-candy/social` | timeline | Composes timeline states and rendered post rows without owning pagination or virtualization. |
| [UserCell](./agent/components/social.user-cell.md) | `@unpopping-candy/social` | identity | Presents a compact person row with optional supporting text and injected action. |
| [Alert](./agent/components/ui.alert.md) | `@unpopping-candy/ui` | feedback | Presents contextual feedback beside the task or content that produced it. |
| [Avatar](./agent/components/ui.avatar.md) | `@unpopping-candy/ui` | identity | Represents a person or organization with an image and deterministic fallback. |
| [Badge](./agent/components/ui.badge.md) | `@unpopping-candy/ui` | data-display | Displays a compact status or categorical label without becoming the primary action. |
| [Button](./agent/components/ui.button.md) | `@unpopping-candy/ui` | action | Triggers an immediate user action with explicit priority and pending behavior. |
| [Container](./agent/components/ui.container.md) | `@unpopping-candy/ui` | layout | Constrains page content to a readable width and consistent horizontal gutter. |
| [Dialog](./agent/components/ui.dialog.md) | `@unpopping-candy/ui` | overlay | Interrupts the current context for a focused task that must be completed or dismissed. |
| [EmptyState](./agent/components/ui.empty-state.md) | `@unpopping-candy/ui` | feedback | Explains why a meaningful region has no content and offers the next valid action. |
| [FeedbackProvider](./agent/components/ui.feedback-provider.md) | `@unpopping-candy/ui` | feedback | Owns the application-level transient feedback queue and exposes a bounded controller. |
| [IconButton](./agent/components/ui.icon-button.md) | `@unpopping-candy/ui` | action | Triggers a frequent action where a well-known icon can replace visible text. |
| [Inline](./agent/components/ui.inline.md) | `@unpopping-candy/ui` | layout | Arranges related items horizontally with tokenized gap, alignment, and wrapping. |
| [Separator](./agent/components/ui.separator.md) | `@unpopping-candy/ui` | layout | Separates adjacent regions when spacing alone cannot communicate the boundary. |
| [Skeleton](./agent/components/ui.skeleton.md) | `@unpopping-candy/ui` | loading | Reserves stable geometry while content is loading. |
| [Spinner](./agent/components/ui.spinner.md) | `@unpopping-candy/ui` | loading | Indicates an indeterminate operation in a compact region. |
| [Stack](./agent/components/ui.stack.md) | `@unpopping-candy/ui` | layout | Arranges a vertical reading or task sequence with tokenized spacing. |
| [Surface](./agent/components/ui.surface.md) | `@unpopping-candy/ui` | layout | Creates a semantic background and boundary without prescribing product content. |
| [Tabs](./agent/components/ui.tabs.md) | `@unpopping-candy/ui` | navigation | Switches among peer views that share one context and URL or controlled state. |
| [TextArea](./agent/components/ui.text-area.md) | `@unpopping-candy/ui` | form | Collects multi-line text with label, description, validation, and native textarea semantics. |
| [TextField](./agent/components/ui.text-field.md) | `@unpopping-candy/ui` | form | Collects one short value with label, description, validation, and native input semantics. |
| [Toast](./agent/components/ui.toast.md) | `@unpopping-candy/ui` | feedback | Renders one transient or persistent item from the feedback queue. |
| [ToastViewport](./agent/components/ui.toast-viewport.md) | `@unpopping-candy/ui` | feedback | Positions and announces the bounded stack of global feedback items. |
| [VisuallyHidden](./agent/components/ui.visually-hidden.md) | `@unpopping-candy/ui` | accessibility | Keeps essential text available to assistive technology without changing visual layout. |

## Product patterns

### Collection states

Provides complete loading, empty, populated, pagination, and error states for a collection.

**Use when**

- A product needs the collection states pattern.

**Anatomy**

- Collection heading
- Controls
- Result region
- Pagination status

**Required states**

- initial-loading
- empty
- populated
- loading-more
- load-more-error
- filtered-empty

**Components**

- `ui.skeleton`
- `ui.empty-state`
- `ui.alert`
- `ui.button`
- `ui.stack`

### Conversation list

Renders conversations with stable selection, unread semantics, and responsive detail navigation.

**Use when**

- A product needs the conversation list pattern.

**Anatomy**

- Inbox heading
- Conversation rows
- Unread indicator
- Selected detail boundary

**Required states**

- loading
- empty
- populated
- selected
- offline

**Components**

- `social.conversation-preview`
- `ui.empty-state`
- `ui.skeleton`
- `ui.alert`

### Feedback and recovery

Chooses inline, global, or route-level feedback while preserving successful data and unfinished work.

**Use when**

- A product needs the feedback and recovery pattern.

**Anatomy**

- Failure boundary
- Preserved state statement
- Recovery action
- Request reference

**Required states**

- recoverable
- offline
- rate-limited
- critical
- recovered

**Components**

- `ui.alert`
- `ui.feedback-provider`
- `ui.toast`
- `ui.empty-state`
- `ui.button`

### Form actions

Orders validation, pending behavior, primary action, and cancellation for a form.

**Use when**

- A product needs the form actions pattern.

**Anatomy**

- Form fields
- Inline validation
- Form-level feedback
- Primary and secondary actions

**Required states**

- pristine
- dirty
- invalid
- submitting
- failed
- succeeded

**Components**

- `ui.text-field`
- `ui.text-area`
- `ui.button`
- `ui.inline`
- `ui.stack`
- `ui.alert`

### Profile surface

Combines profile identity, relationship action, tabs, and state-complete collections.

**Use when**

- A product needs the profile surface pattern.

**Anatomy**

- Profile identity
- Primary relationship action
- Peer view tabs
- Collection region

**Required states**

- loading
- self
- other
- private
- blocked
- not-found

**Components**

- `social.profile-header`
- `social.user-cell`
- `ui.tabs`
- `ui.empty-state`
- `ui.alert`

### Social feed

Composes a readable, state-complete social timeline without moving content unexpectedly.

**Use when**

- A product needs the social feed pattern.

**Anatomy**

- Feed controls
- Composer
- New-item notice
- Timeline rows
- Pagination sentinel

**Required states**

- initial-loading
- populated
- empty
- loading-more
- load-more-error
- new-items-available

**Components**

- `social.timeline-view`
- `social.post-card`
- `social.post-card-skeleton`
- `social.post-composer-view`

## Templates

- **Strict FSD social shell** (`template.fsd-social-shell`, target: `react-vite-fsd`): A React and Vite application shell that keeps Unpopping Candy presentation packages below FSD application slices.
- **Moderation workspace** (`template.moderation-workspace`, target: `react-vite`): A three-region moderation decision workspace with queue, evidence, and controlled actions.
- **Profile settings** (`template.profile-settings`, target: `react-vite`): A profile settings form with validation, pending state, and preserved failure feedback.
- **Social feed page** (`template.social-feed-page`, target: `react-vite`): A state-complete social feed page using presentation models and externally owned remote state.
- **Vite app shell** (`template.vite-app-shell`, target: `react-vite`): A minimal React and Vite shell with Unpopping Candy theme and feedback providers.

## Accessibility baseline

- Meet WCAG 2.2 AA for shipped surfaces.
- Preserve native semantics and visible keyboard focus.
- Give every icon-only control an accessible name.
- Do not encode status with color alone.
- Maintain a usable 320px reflow and 200% zoom.
- Keep loading, errors, and state changes available to assistive technology.
- Restore focus after overlays close and avoid unexpected focus movement.

## Content and feedback language

Use specific verbs and name the affected object. For failures, state what failed, what remains preserved, and the next valid action. Never render raw server messages, tokens, stack traces, or unvalidated request identifiers.

## Do

- Search and reuse a stable component or pattern before creating a new one.
- Compose layout with Stack, Inline, Container, and Surface.
- Keep application state and side effects in the consuming app.
- Use controlled props for product behavior.
- Include representative Korean, English, long-content, mobile, dark, and high-contrast states in stories.

## Do not

- Import from `@unpopping-candy/*/src/*`.
- Fetch, navigate, authenticate, or mutate inside `@unpopping-candy/ui` or `@unpopping-candy/social`.
- Hardcode brand colors, spacing, radius, shadows, or motion durations.
- Invent component props or component names.
- Treat a static screenshot as functional UI.
- Omit loading, empty, failure, and disabled states where they are possible.

## AI workflow

```text
popcandy info --json
→ popcandy search "<task>" --json
→ popcandy compose "<task>" --json
→ inspect selected component and pattern guidance
→ scaffold or implement with public imports
→ create/update Storybook stories
→ popcandy validate --json
→ Storybook interaction and accessibility checks
```

## Canonical sources

- Catalog: `agent/manifests/catalog.json`
- Components: `agent/components/*.md`
- Patterns: `agent/patterns/*.md`
- Tokens: `agent/llms-tokens.txt`
- Migrations: `agent/llms-migrations.txt`
- Skills: `skills/*/SKILL.md`
