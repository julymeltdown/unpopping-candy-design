# Unpopping Candy Stage 2 Interactions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the accessible action, overlay, and disclosure APIs needed to review a member and take a moderation action without moving authorization or mutation ownership into Unpopping Candy.

**Architecture:** Wrap React Aria Components behind small Unpopping Candy contracts. `MenuSection` owns checkbox or radio selection, overlay primitives own focus and dismissal behavior, and `Disclosure`/`Accordion` expose string-based controlled state. A Storybook-only moderation composition and the existing Registry template prove the vertical workflow while keeping application state outside `@unpopping-candy/ui` and `@unpopping-candy/social`.

**Tech Stack:** React 18.3/19, TypeScript, React Aria Components 1.20.0, Vite 8, Storybook 10.5, Vitest 4 browser mode, Playwright, axe, pnpm 11, Changesets.

## Global Constraints

- Public brand: `Unpopping Candy`; public command: `popcandy`; do not introduce `commonspace` names.
- Public packages remain `tokens`, `theme`, `icons`, `ui`, `social`, `knowledge`, `registry`, `cli`, and `mcp`; `evals` and `figma` remain private repository tooling.
- React peer range is `>=18.3 <20`; CLI and MCP support Node.js 22.13+ and 24.x; public declarations must compile with TypeScript 5.7+.
- Published packages are ESM with explicit `exports`; CommonJS and undocumented deep imports are unsupported.
- React Aria Components is an implementation dependency. Do not export its props, `Key`, `Selection`, render-state types, class names, or `data-*` attributes.
- Public interaction props use `open`, `defaultOpen`, `onOpenChange`, `disabled`, `expanded`, and string IDs. Translate them to React Aria's internal `isOpen`, `isDisabled`, `isExpanded`, and selection types.
- Styling uses semantic `--popcandy-*` tokens, `.popcandy-*` classes, logical CSS properties, and documented `data-popcandy-*` attributes. Do not add a recipes DSL or hardcoded visual values when a semantic token exists.
- Visible strings are consumer-supplied. The new components contain no hardcoded English labels, descriptions, empty text, or action text.
- Presentation packages do not own fetching, routing, authentication, authorization, mutations, caches, API DTOs, or business workflow state.
- Accessibility target is WCAG 2.2 AA. Keyboard traps, focus loss, missing names, incorrect roles/states, and blocking screen-reader failures block this stage.
- A public component is incomplete without a stable export and catalog ID, typed props and native/ref behavior, adjacent metadata, Storybook interaction and axe evidence, a clean packed consumer, generated agent/Figma artifacts, bundle evidence, and a Changeset.
- Stage 2 stages the exact coordinated `0.3.0-beta.0` candidate for the `next` channel. Candidate creation is local-only; npm publication and externally funded browser, AT, or visual services require owner authorization.
- Component and pattern source metadata uses `version: "0.3.0"` and `status: "beta"` to record the stable API-introduction target. Candidate manifests, packed package versions, compatibility records, and provenance use the exact prerelease `0.3.0-beta.0`.
- Generated files are regenerated from their sources and never edited directly.

---

## Entry Gate and Public Decisions

Stage 0 and Stage 1 must be green before starting. Stage 0 provides one compatibility engine, one immutable roadmap budget, and the local-only candidate command used below:

```bash
pnpm bundle:check -- --stage stage-2 --json .artifacts/bundles/stage-2.json
pnpm fixtures:compat -- --fixture member-moderation --cell vite-react-19 --manager pnpm-11
pnpm fixtures:compat -- --fixture member-moderation --all
pnpm release:candidate -- --version 0.3.0-beta.0 --channel next --out .artifacts/releases/stage-2-beta.0
```

The approved Stage 2 public surface is exactly:

```ts
export {
  Menu,
  MenuTrigger,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuCheckboxItem,
  MenuRadioItem,
} from "@unpopping-candy/ui/menu";
export { Popover } from "@unpopping-candy/ui/popover";
export { Tooltip } from "@unpopping-candy/ui/tooltip";
export { Disclosure, Accordion } from "@unpopping-candy/ui/disclosure";
```

Grouped checkbox and radio choices satisfy the moderation workflow. Nested menus are deliberately excluded because the approved `0.3` surface has no public submenu trigger; do not leak React Aria's `SubmenuTrigger` to add one indirectly.

## File Map

### Public UI source

- Create `packages/ui/src/menu/menu-selection.ts`: internal conversion between React Aria selections and public string values.
- Create `packages/ui/src/menu/menu.tsx`: the seven public menu components and their Unpopping Candy props.
- Create `packages/ui/src/menu/*.docs.ts`: one metadata contract for each of the seven exported menu components.
- Create `packages/ui/src/menu.ts`: `@unpopping-candy/ui/menu` barrel.
- Create `packages/ui/src/popover/popover.tsx`, `popover.docs.ts`, and `packages/ui/src/popover.ts`: trigger-based dialog popover and subpath.
- Create `packages/ui/src/tooltip/tooltip.tsx`, `tooltip.docs.ts`, and `packages/ui/src/tooltip.ts`: focus/hover tooltip and subpath.
- Create `packages/ui/src/disclosure/disclosure.tsx`, `disclosure.docs.ts`, `accordion.docs.ts`, and `packages/ui/src/disclosure.ts`: standalone disclosure and item-driven accordion.
- Modify `packages/ui/src/index.ts`, `packages/ui/src/styles.css`, `packages/ui/package.json`, and `packages/ui/vite.config.ts`: public exports, semantic styling, dependency, and build entries.

### Tests, stories, and workflow proof

- Create `packages/ui/test/menu-selection.test.ts`: pure selection adaptation tests.
- Create `apps/docs/stories/catalog/ui/Menu.stories.tsx`, `Popover.stories.tsx`, `Tooltip.stories.tsx`, `Disclosure.stories.tsx`, and `Accordion.stories.tsx`: contract stories with interaction tests.
- Create `apps/docs/stories/catalog/workflows/member-moderation-fixture.tsx`: controlled, app-owned moderation composition.
- Create `apps/docs/stories/catalog/workflows/MemberModeration.stories.tsx`: safe, destructive, denied, pending, and failed workflow stories.
- Create `packages/knowledge/content/patterns/pattern-member-moderation.docs.ts`: agent guidance for the workflow.
- Modify `packages/knowledge/content/templates/template-moderation-workspace.docs.ts` and both files under `packages/registry/templates/moderation-workspace/src/`: keep the Registry template aligned with the public workflow.
- Modify `fixtures/compatibility/scenarios/member-moderation.tsx`: replace the Stage 0 fallback surface with the Stage 2 controls while preserving its registered fixture ID in the single compatibility engine.
- Read `fixtures/compatibility/matrix.json`: consume the Stage 0 `member-moderation` registration unchanged; do not add or modify a fixture record, runner, matrix, or installation path.
- Modify `packages/evals/src/reference-scenarios.ts`: deterministic agent-output scenario for valid imports, props, tokens, and app-owned state.

### Generated outputs

`npm run agent:generate` updates `packages/knowledge/src/generated/catalog.ts`, `agent/manifests/*.json`, `agent/components/*.md`, `agent/patterns/pattern.member-moderation.md`, `agent/llms*.txt`, `DESIGN.md`, `packages/registry/src/registry.json`, and the eleven new `figma/code-connect/*.figma.ts` files. Review these outputs but do not hand-edit them.

---

### Task 1: Lock the Menu API and selection boundary

**Files:**

- Create: `packages/ui/src/menu/menu-selection.ts`
- Create: `packages/ui/test/menu-selection.test.ts`

**Interfaces:**

- Consumes: internal React Aria `Selection` values only inside `menu-selection.ts`.
- Produces: `selectionToValues(selection: 'all' | ReadonlySet<React.Key>, knownValues: readonly string[]): readonly string[]` and `singleSelectionValue(selection: 'all' | ReadonlySet<React.Key>): string | null`.

- [ ] **Step 1: Verify the installed catalog before adding interface code**

Run:

```bash
npm run popcandy -- info --path . --json
npm run popcandy -- search "member moderation actions" --json
npm run popcandy -- compose "member review with grouped actions, confirmation, permission denied, pending, and error states" --json
npm run popcandy -- get ui.button --json
npm run popcandy -- get ui.dialog --json
npm run popcandy -- get social.user-cell --json
```

Expected: Stage 1 versions resolve from installed manifests, existing IDs return exact contracts, and no Stage 2 ID is claimed before generation.

- [ ] **Step 2: Write the failing pure tests**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  selectionToValues,
  singleSelectionValue,
} from "../src/menu/menu-selection.ts";

test("menu selection converts only public string IDs and preserves known order for all", () => {
  assert.deepEqual(selectionToValues("all", ["warn", "suspend"]), [
    "warn",
    "suspend",
  ]);
  assert.deepEqual(
    selectionToValues(new Set(["suspend", "warn"]), ["warn", "suspend"]),
    ["suspend", "warn"],
  );
  assert.throws(() => selectionToValues(new Set([1]), ["warn"]), /string IDs/);
});

test("radio selection returns zero or one public string ID", () => {
  assert.equal(singleSelectionValue(new Set()), null);
  assert.equal(singleSelectionValue(new Set(["seven-days"])), "seven-days");
  assert.throws(
    () => singleSelectionValue(new Set(["one-day", "seven-days"])),
    /one value/,
  );
  assert.throws(() => singleSelectionValue("all"), /cannot select all/);
});
```

- [ ] **Step 3: Run the focused test and observe the red state**

Run: `node --experimental-strip-types --test packages/ui/test/menu-selection.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `menu-selection.ts`.

- [ ] **Step 4: Implement the internal conversion functions**

```ts
import type { Key } from "react";

type InternalSelection = "all" | ReadonlySet<Key>;

function stringValue(key: Key): string {
  if (typeof key !== "string")
    throw new Error("Menu selection accepts string IDs only.");
  return key;
}

export function selectionToValues(
  selection: InternalSelection,
  knownValues: readonly string[],
): readonly string[] {
  return selection === "all"
    ? [...knownValues]
    : [...selection].map(stringValue);
}

export function singleSelectionValue(
  selection: InternalSelection,
): string | null {
  if (selection === "all")
    throw new Error("A radio menu cannot select all values.");
  if (selection.size > 1)
    throw new Error("A radio menu must select at most one value.");
  const first = selection.values().next().value;
  return first === undefined ? null : stringValue(first);
}
```

- [ ] **Step 5: Run the focused and package tests**

Run:

```bash
node --experimental-strip-types --test packages/ui/test/menu-selection.test.ts
pnpm --filter @unpopping-candy/ui test
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit the selection boundary**

```bash
git add packages/ui/src/menu/menu-selection.ts packages/ui/test/menu-selection.test.ts
git commit -m "feat(ui): define menu selection boundary"
```

### Task 2: Implement Menu and its named contracts

**Files:**

- Create: `packages/ui/src/menu/menu.tsx`
- Create: `packages/ui/src/menu/menu.docs.ts`
- Create: `packages/ui/src/menu/menu-trigger.docs.ts`
- Create: `packages/ui/src/menu/menu-item.docs.ts`
- Create: `packages/ui/src/menu/menu-section.docs.ts`
- Create: `packages/ui/src/menu/menu-separator.docs.ts`
- Create: `packages/ui/src/menu/menu-checkbox-item.docs.ts`
- Create: `packages/ui/src/menu/menu-radio-item.docs.ts`
- Create: `packages/ui/src/menu.ts`
- Create: `apps/docs/stories/catalog/ui/Menu.stories.tsx`

**Interfaces:**

- Consumes: `selectionToValues` and `singleSelectionValue` from Task 1; React Aria only inside `menu.tsx`.
- Produces the exact public types below; all item IDs and selection values are strings.

```ts
export type MenuPlacement =
  | "bottom"
  | "bottom start"
  | "bottom end"
  | "top"
  | "top start"
  | "top end";

export interface MenuTriggerProps {
  trigger: ReactElement;
  children: ReactElement<MenuProps>;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export interface MenuProps {
  ariaLabel: string;
  children: ReactNode;
  placement?: MenuPlacement;
  emptyContent?: ReactNode;
  className?: string;
}

export interface MenuItemProps {
  id: string;
  children: ReactNode;
  description?: ReactNode;
  shortcut?: string;
  leadingIcon?: ReactNode;
  tone?: "default" | "critical";
  disabled?: boolean;
  onAction?: () => void;
}

export type MenuSectionSelection =
  | {
      type: "checkbox";
      values: readonly string[];
      onValuesChange(values: readonly string[]): void;
    }
  | {
      type: "radio";
      value: string | null;
      onValueChange(value: string | null): void;
      disallowEmpty?: boolean;
    };

export interface MenuSectionProps {
  id: string;
  label: ReactNode;
  children: ReactNode;
  selection?: MenuSectionSelection;
}

export interface MenuSeparatorProps {
  className?: string;
}
export type MenuCheckboxItemProps = Omit<MenuItemProps, "onAction">;
export type MenuRadioItemProps = Omit<MenuItemProps, "onAction">;
```

- [ ] **Step 1: Write the failing Storybook contracts**

Create stories named `Contract`, `GroupedSelection`, `KeyboardAndFocus`, `OutsideDismissal`, `DisabledAndCritical`, `Empty`, `LongContent`, and `Rtl`. The interaction story must include these assertions:

```tsx
export const KeyboardAndFocus: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Member actions" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const menu = within(document.body).getByRole("menu", {
      name: "Member actions",
    });
    await expect(menu).toBeVisible();
    await userEvent.keyboard("{ArrowDown}{End}{Home}");
    await expect(
      within(menu).getByRole("menuitem", { name: /View profile/ }),
    ).toHaveFocus();
    await userEvent.keyboard("s");
    await expect(
      within(menu).getByRole("menuitem", { name: /Suspend member/ }),
    ).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};
```

`GroupedSelection` must assert `menuitemcheckbox` and `menuitemradio` roles, Space toggling without closing, disabled items not invoking callbacks, and controlled callbacks receiving only string values. `OutsideDismissal` must click a named outside button and assert the trigger regains focus. `Rtl` wraps the contract in `<div dir="rtl">` and repeats ArrowUp/ArrowDown/Home/End navigation.

- [ ] **Step 2: Run the story and observe the red state**

Run: `pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Menu.stories.tsx`

Expected: FAIL because `@unpopping-candy/ui/menu` does not exist.

- [ ] **Step 3: Implement the wrappers without exporting React Aria types**

Use aliased internal imports and the public prop mapping:

```tsx
import {
  Header as AriaHeader,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuSection as AriaMenuSection,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  Pressable,
  Separator as AriaSeparator,
} from "react-aria-components";

export function MenuTrigger({
  trigger,
  children,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
}: MenuTriggerProps) {
  return (
    <AriaMenuTrigger
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      isDisabled={disabled}
    >
      <Pressable>{trigger}</Pressable>
      {children}
    </AriaMenuTrigger>
  );
}
```

`Menu` renders `AriaPopover` and `AriaMenu`, uses `aria-label={ariaLabel}`, and maps `emptyContent` to `renderEmptyState`. `MenuSection` maps the discriminated `selection` to section-level `selectionMode`, `selectedKeys`, and `onSelectionChange`. `MenuCheckboxItem` is valid only inside a checkbox section and `MenuRadioItem` only inside a radio section; enforce this with an internal context and throw a component-named error for an invalid pairing. Action items close after activation; checkbox and radio items remain open.

Every component sets `data-popcandy-component`. Render-state content wrappers expose documented boolean attributes: `data-popcandy-hovered`, `data-popcandy-pressed`, `data-popcandy-focused`, `data-popcandy-focus-visible`, `data-popcandy-selected`, `data-popcandy-disabled`, and `data-popcandy-open`. Do not document React Aria's own selectors.

- [ ] **Step 4: Add one metadata object per exported component**

Use this exact contract map in the seven data-only `*.docs.ts` objects:

| ID                      | Name               | Story                                | States                                                             | Composition                                   |
| ----------------------- | ------------------ | ------------------------------------ | ------------------------------------------------------------------ | --------------------------------------------- |
| `ui.menu`               | `Menu`             | `catalog-ui-menu--contract`          | open, empty, populated                                             | children: all menu item/section/separator IDs |
| `ui.menu-trigger`       | `MenuTrigger`      | `catalog-ui-menu--contract`          | closed, open, disabled                                             | children: `ui.menu`                           |
| `ui.menu-item`          | `MenuItem`         | `catalog-ui-menu--contract`          | idle, hovered, focused, focus-visible, pressed, disabled, critical | parent: `ui.menu`, `ui.menu-section`          |
| `ui.menu-section`       | `MenuSection`      | `catalog-ui-menu--grouped-selection` | action, checkbox, radio                                            | parent: `ui.menu`                             |
| `ui.menu-separator`     | `MenuSeparator`    | `catalog-ui-menu--contract`          | static                                                             | parent: `ui.menu`                             |
| `ui.menu-checkbox-item` | `MenuCheckboxItem` | `catalog-ui-menu--grouped-selection` | checked, unchecked, focus-visible, disabled                        | parent: checkbox `ui.menu-section`            |
| `ui.menu-radio-item`    | `MenuRadioItem`    | `catalog-ui-menu--grouped-selection` | selected, unselected, focus-visible, disabled                      | parent: radio `ui.menu-section`               |

Each object uses package `@unpopping-candy/ui`, source metadata version `0.3.0`, status `beta`, entrypoints `@unpopping-candy/ui` and `@unpopping-candy/ui/menu`, source path `packages/ui/src/menu/menu.tsx`, semantic overlay/menu tokens, keyboard requirements, and preferred examples using the public names above. That metadata names the stable API-introduction target; Task 7's candidate receipts and packed manifests name `0.3.0-beta.0`.

- [ ] **Step 5: Run focused verification**

```bash
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Menu.stories.tsx
```

Expected: both commands exit 0; Storybook axe reports no violations.

- [ ] **Step 6: Commit Menu**

```bash
git add packages/ui/src/menu packages/ui/src/menu.ts apps/docs/stories/catalog/ui/Menu.stories.tsx
git commit -m "feat(ui): add accessible menu family"
```

### Task 3: Implement Popover and Tooltip overlay contracts

**Files:**

- Create: `packages/ui/src/popover/popover.tsx`
- Create: `packages/ui/src/popover/popover.docs.ts`
- Create: `packages/ui/src/popover.ts`
- Create: `packages/ui/src/tooltip/tooltip.tsx`
- Create: `packages/ui/src/tooltip/tooltip.docs.ts`
- Create: `packages/ui/src/tooltip.ts`
- Create: `apps/docs/stories/catalog/ui/Popover.stories.tsx`
- Create: `apps/docs/stories/catalog/ui/Tooltip.stories.tsx`

**Interfaces:**

- Consumes: React Aria `DialogTrigger`, `Popover`, `Dialog`, `TooltipTrigger`, `Tooltip`, `Pressable`, and `Focusable` internally.
- Produces these public APIs:

```ts
export interface PopoverProps {
  trigger: ReactElement;
  label: string;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: MenuPlacement;
  dismissible?: boolean;
  className?: string;
}

export interface TooltipProps {
  trigger: ReactElement;
  children: ReactNode;
  placement?: "top" | "bottom" | "start" | "end";
  delayMs?: number;
  closeDelayMs?: number;
  disabled?: boolean;
  className?: string;
}
```

- [ ] **Step 1: Write red interaction stories**

`Popover.stories.tsx` exports `Contract`, `Controlled`, `EscapeRestoresFocus`, `OutsideDismissal`, `NonDismissible`, `LongContent`, and `RtlPlacement`. Assert that Enter opens a labelled `dialog`, Tab stays within its interactive content, Escape and an outside click close when `dismissible`, and focus returns to the trigger. Assert Escape and outside clicks do not close `NonDismissible`, while its consumer-supplied close button calls `onOpenChange(false)`.

`Tooltip.stories.tsx` exports `Contract`, `KeyboardFocus`, `HoverDelay`, `Disabled`, `LongContent`, and `Rtl`. Assert a focused trigger exposes a visible `tooltip`, Escape dismisses it without moving trigger focus, hover honors `delayMs`, and a disabled tooltip never appears. The trigger itself must have its own accessible name; tooltip text must never be its only essential instruction.

- [ ] **Step 2: Observe missing-module failures**

```bash
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Popover.stories.tsx
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Tooltip.stories.tsx
```

Expected: both commands fail because the new subpaths do not exist.

- [ ] **Step 3: Implement the public-to-internal mapping**

```tsx
export function Popover({
  trigger,
  label,
  children,
  open,
  defaultOpen,
  onOpenChange,
  placement = "bottom start",
  dismissible = true,
  className,
}: PopoverProps) {
  return (
    <AriaDialogTrigger
      isOpen={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <Pressable>{trigger}</Pressable>
      <AriaPopover
        placement={placement}
        isDismissable={dismissible}
        className={mergeClassNames("popcandy-popover", className)}
      >
        <AriaDialog aria-label={label} className="popcandy-popover__dialog">
          {children}
        </AriaDialog>
      </AriaPopover>
    </AriaDialogTrigger>
  );
}
```

Map `Tooltip.delayMs` to internal `delay`, `closeDelayMs` to `closeDelay`, and `disabled` to `isDisabled`. Wrap arbitrary forwarded-ref triggers with `Focusable`; reject a trigger without a semantic interactive element in development. Both components set their static `data-popcandy-component` attribute and mirror entering, exiting, open, and placement states to documented `data-popcandy-*` attributes on their styled content element.

- [ ] **Step 4: Add exact catalog contracts**

`popover.docs.ts` defines `ui.popover`, category `overlay`, story `catalog-ui-popover--contract`, entrypoints root and `/popover`, states `closed/opening/open/closing`, and requirements for a labelled dialog, focus containment, Escape, outside dismissal, and focus restoration. `tooltip.docs.ts` defines `ui.tooltip`, story `catalog-ui-tooltip--contract`, entrypoints root and `/tooltip`, states `closed/delayed/open/closing/disabled`, and requirements for focus/hover parity, nonessential content, touch alternatives, and trigger naming.

- [ ] **Step 5: Run the two browser contracts and typecheck**

```bash
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Popover.stories.tsx
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Tooltip.stories.tsx
```

Expected: all commands exit 0 with interaction and axe checks green.

- [ ] **Step 6: Commit overlays**

```bash
git add packages/ui/src/popover packages/ui/src/popover.ts packages/ui/src/tooltip packages/ui/src/tooltip.ts apps/docs/stories/catalog/ui/Popover.stories.tsx apps/docs/stories/catalog/ui/Tooltip.stories.tsx
git commit -m "feat(ui): add popover and tooltip"
```

### Task 4: Implement Disclosure and Accordion

**Files:**

- Create: `packages/ui/src/disclosure/disclosure.tsx`
- Create: `packages/ui/src/disclosure/disclosure.docs.ts`
- Create: `packages/ui/src/disclosure/accordion.docs.ts`
- Create: `packages/ui/src/disclosure.ts`
- Create: `apps/docs/stories/catalog/ui/Disclosure.stories.tsx`
- Create: `apps/docs/stories/catalog/ui/Accordion.stories.tsx`

**Interfaces:**

- Consumes: React Aria `Disclosure`, `DisclosureGroup`, `Heading`, `Button`, and `DisclosurePanel` internally.
- Produces:

```ts
export interface DisclosureProps {
  id?: string;
  title: ReactNode;
  children: ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  ariaLabel: string;
  items: readonly AccordionItem[];
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  expandedIds?: readonly string[];
  defaultExpandedIds?: readonly string[];
  onExpandedChange?: (ids: readonly string[]) => void;
  allowsMultiple?: boolean;
  className?: string;
}
```

- [ ] **Step 1: Write browser contracts before source**

`Disclosure.stories.tsx` exports `Contract`, `Controlled`, `Disabled`, `LongContent`, and `Rtl`; `Accordion.stories.tsx` exports `Contract`, `SingleExpansion`, `MultipleExpansion`, `Controlled`, `DisabledItem`, and `Rtl`. Use `getByRole('button', { name })`, assert `aria-expanded`, assert hidden panels are absent from the accessibility tree, and verify Enter and Space toggle. For single expansion, opening a second item closes the first; for multiple expansion, both remain open. Assert callback payloads contain string IDs in item order.

- [ ] **Step 2: Observe the red tests**

```bash
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Disclosure.stories.tsx
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Accordion.stories.tsx
```

Expected: missing `/disclosure` exports fail module resolution.

- [ ] **Step 3: Implement string-based controlled state**

Render the public `title` inside an internal heading and trigger button, and `children` inside `DisclosurePanel`. Map `expanded`/`defaultExpanded`/`disabled` to internal state names. `Accordion` maps `expandedIds` and `defaultExpandedIds` to `Set<string>`, maps the internal set back to a readonly string array following `items` order, and maps `allowsMultiple` to `allowsMultipleExpanded`. Validate duplicate item IDs with a component-named error before rendering.

Use `data-popcandy-component="disclosure"` or `"accordion"`, plus `data-popcandy-expanded`, `data-popcandy-disabled`, and `data-popcandy-focus-visible`. The chevron uses a non-directional rotation; all padding, margin, and borders use logical properties so RTL does not require alternate markup.

- [ ] **Step 4: Add metadata**

Define `ui.disclosure` with story `catalog-ui-disclosure--contract`, states `collapsed/expanded/disabled/focus-visible`, and native button/region semantics. Define `ui.accordion` with story `catalog-ui-accordion--contract`, states `collapsed/partially-expanded/expanded/disabled`, composition child `ui.disclosure`, and explicit single/multiple keyboard guidance. Both use version `0.3.0`, status `beta`, package root plus `/disclosure`, and semantic surface/border/focus/motion tokens.

- [ ] **Step 5: Run focused verification**

```bash
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Disclosure.stories.tsx
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Accordion.stories.tsx
```

Expected: all commands exit 0.

- [ ] **Step 6: Commit disclosure APIs**

```bash
git add packages/ui/src/disclosure packages/ui/src/disclosure.ts apps/docs/stories/catalog/ui/Disclosure.stories.tsx apps/docs/stories/catalog/ui/Accordion.stories.tsx
git commit -m "feat(ui): add disclosure and accordion"
```

### Task 5: Publish exports, semantic styling, and package boundaries

**Files:**

- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles.css`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/vite.config.ts`
- Modify: `pnpm-lock.yaml`
- Modify: `scripts/verify-css-contract.mjs`
- Modify: `scripts/verify-exports.mjs`

**Interfaces:**

- Consumes: Tasks 2–4 public barrels.
- Produces: root and `./menu`, `./popover`, `./tooltip`, `./disclosure` export-map entries; internal `react-aria-components@1.20.0` dependency; CSS state contract.

- [ ] **Step 1: Extend contract tests before manifests**

Add exact export assertions for the four subpaths and reject `react-aria-components` names in generated declarations. Extend CSS verification to require each new `.popcandy-*` root and reject physical `margin-left`, `margin-right`, `padding-left`, `padding-right`, `left`, and `right` within the new component blocks.

- [ ] **Step 2: Observe the red contract checks**

```bash
node scripts/verify-exports.mjs
node scripts/verify-css-contract.mjs
```

Expected: FAIL for absent subpaths and component selectors.

- [ ] **Step 3: Wire the public package**

Add `react-aria-components: 1.20.0` to UI dependencies, add it to Vite external dependencies, add build entries `menu`, `popover`, `tooltip`, and `disclosure`, and add matching package `exports`. Root `index.ts` re-exports only the public types and components defined in this plan; it does not re-export React Aria.

Style menu, overlay, tooltip, disclosure, and accordion states with existing semantic tokens. Add a new token only when no existing semantic token expresses the role; if one is needed, change `packages/tokens/src/tokens.json` and its generated CSS in the same task. Use forced-colors and reduced-motion media queries, minimum touch targets, visible focus, text wrapping, viewport-bounded overlays, and logical placement rules.

- [ ] **Step 4: Install and run package gates**

```bash
pnpm install --lockfile-only
node scripts/verify-exports.mjs
node scripts/verify-css-contract.mjs
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/ui build
```

Expected: every command exits 0 and declarations contain no public import from `react-aria-components`.

- [ ] **Step 5: Commit package wiring**

```bash
git add packages/ui/src/index.ts packages/ui/src/styles.css packages/ui/package.json packages/ui/vite.config.ts pnpm-lock.yaml scripts/verify-css-contract.mjs scripts/verify-exports.mjs packages/tokens/src/tokens.json packages/tokens/src/styles.css
git commit -m "feat(ui): publish interaction entrypoints"
```

If no token file changed, omit both token paths from `git add`.

### Task 6: Complete the member moderation flagship workflow

**Files:**

- Create: `apps/docs/stories/catalog/workflows/member-moderation-fixture.tsx`
- Create: `apps/docs/stories/catalog/workflows/MemberModeration.stories.tsx`
- Create: `packages/knowledge/content/patterns/pattern-member-moderation.docs.ts`
- Modify: `packages/knowledge/content/templates/template-moderation-workspace.docs.ts`
- Modify: `packages/registry/templates/moderation-workspace/src/moderation-workspace.tsx`
- Modify: `packages/registry/templates/moderation-workspace/src/moderation-workspace.css`
- Modify: `fixtures/compatibility/scenarios/member-moderation.tsx`
- Read: `fixtures/compatibility/matrix.json`
- Modify: `packages/evals/src/reference-scenarios.ts`

**Interfaces:**

- Consumes: `UserCell`, `Alert`, `Button`, `Dialog`, and all Stage 2 APIs.
- Produces this app-owned story/fixture boundary:

```ts
export type ModerationAction = "warn" | "restrict" | "suspend";

export interface ModerationAuthorization {
  allowedActions: readonly ModerationAction[];
  deniedReason: string;
}

export interface MemberModerationFixtureProps {
  authorization: ModerationAuthorization;
  pendingAction: ModerationAction | null;
  error: string | null;
  onAction(action: ModerationAction): void;
}
```

- [ ] **Step 1: Write the red workflow story**

Export `Contract`, `PermissionDenied`, `Pending`, and `Failed`. The contract uses grouped Menu sections, a critical `suspend` item, a Dialog confirmation, a Popover with consumer-supplied policy context, a Tooltip on an already named icon button, and Disclosure/Accordion evidence. Its play function must open the menu, inspect safe and critical actions, select `suspend`, confirm the Dialog, and assert `onAction('suspend')` exactly once.

`PermissionDenied` passes no `suspend` authorization and visibly supplies `deniedReason`; `Pending` passes `pendingAction="suspend"`, disables repeat mutation, retains member context, and labels progress; `Failed` renders an Alert while retaining the selected action and retry callback. No component reads a role, token, session, API DTO, or network state.

- [ ] **Step 2: Observe the Storybook and registered-fallback contract failures**

Run:

```bash
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/workflows/MemberModeration.stories.tsx
pnpm fixtures:compat -- --fixture member-moderation --cell vite-react-19 --manager pnpm-11
```

Expected: the Storybook command fails because `member-moderation-fixture.tsx` is absent. The compatibility command recognizes the existing `member-moderation` registration, reaches the Stage 0 fallback source, then fails the Stage 2 contract because the fallback does not import `/menu`, `/popover`, `/tooltip`, and `/disclosure` or render the permission-denied, pending, error, and destructive-confirmation assertions.

- [ ] **Step 3: Implement the controlled composition**

Use only public imports:

```tsx
import {
  Accordion,
  Alert,
  Button,
  Dialog,
  Disclosure,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  Popover,
  Tooltip,
} from "@unpopping-candy/ui";
import { UserCell } from "@unpopping-candy/social";
```

The Registry template accepts authorization, pending, error, and callbacks as props. It must not import `fetch`, TanStack Query, SWR, Zustand, router packages, JWT helpers, or API models. Its CSS uses only semantic tokens and logical properties.

- [ ] **Step 4: Update deterministic knowledge and evaluation sources**

Create pattern ID `pattern.member-moderation` with components `social.user-cell`, all eleven Stage 2 IDs, `ui.alert`, `ui.button`, and `ui.dialog`; states `ready`, `permission-denied`, `confirming`, `pending`, `failed`, `completed`; and flow `review context`, `check app authorization`, `choose action`, `confirm destructive action`, `invoke app mutation`, `preserve context on failure`.

Update `template.moderation-workspace` to reference the pattern and new public components. Add a deterministic eval scenario whose expected components include `ui.menu`, `ui.popover`, `ui.disclosure`, `ui.dialog`, and `social.user-cell`, and whose valid source receives `authorization`, `pendingAction`, `error`, and `onAction` as props. The evaluator must flag a UI-package `fetch`, invented `canSuspend` prop on Menu, private import, hardcoded color, or missing confirmation.

- [ ] **Step 5: Replace the registered Stage 0 fallback source**

The scenario imports `/menu`, `/popover`, `/tooltip`, and `/disclosure` subpaths plus `@unpopping-candy/social/user`, renders the controlled props above, and performs no workspace-relative import.

Replace the contents of the already registered `fixtures/compatibility/scenarios/member-moderation.tsx` fallback with the Stage 2 controlled composition. Preserve the existing `member-moderation` record and source path in `fixtures/compatibility/matrix.json` byte-for-byte. Do not add a fixture record, second compatibility script, package-packing loop, temporary-install implementation, or result schema. The source must use the Stage 0 engine's existing nine-package pack, digest, install, typecheck, build, smoke, and receipt path.

- [ ] **Step 6: Pass focused browser, clean-consumer, and eval proof**

Run:

```bash
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/workflows/MemberModeration.stories.tsx
pnpm fixtures:compat -- --fixture member-moderation --cell vite-react-19 --manager pnpm-11
npm run evals:generate
npm run evals:check
```

Expected: Storybook interaction/axe passes, the single Stage 0 engine selects the registered `member-moderation` fixture, installs nine packed artifacts outside the workspace, records exact digests and versions, and exits 0; deterministic eval output is stable.

- [ ] **Step 7: Commit the vertical workflow**

```bash
git add apps/docs/stories/catalog/workflows packages/knowledge/content/patterns/pattern-member-moderation.docs.ts packages/knowledge/content/templates/template-moderation-workspace.docs.ts packages/registry/templates/moderation-workspace fixtures/compatibility/scenarios/member-moderation.tsx packages/evals/src/reference-scenarios.ts
git commit -m "feat: prove member moderation workflow"
```

### Task 7: Generate evidence, enforce budgets, and prepare the beta

**Files:**

- Modify generated outputs from `npm run agent:generate`
- Create: `.changeset/stage-two-interactions.md`
- Create: `docs/accessibility/evidence/stage-2-interactions.md`
- Read: `config/bundle-budgets.json` immutable Stage 0 roadmap allocation for `stage-2`
- Generate, do not commit: `.artifacts/bundles/stage-2.json`
- Generate, do not commit: `.artifacts/releases/stage-2-beta.0/`

**Interfaces:**

- Consumes: all completed tasks and Stage 0 verification harnesses.
- Produces: truthful installed catalog, generated docs/Figma templates, packed-consumer evidence, immutable-budget report, accessibility record, a normal Stage 2 Changeset, and a local-only nine-package `0.3.0-beta.0` candidate.

- [ ] **Step 1: Regenerate from canonical source**

```bash
npm run agent:generate
npm run agent:check
npm run popcandy -- search "moderation actions" --json
npm run popcandy -- get ui.menu --json
npm run popcandy -- get pattern.member-moderation --json
npm run popcandy -- compose "review a member and take a moderation action with permission denied, pending, and error states" --json
npm run popcandy -- validate --path . --json
```

Expected: all commands exit 0; search explains the new beta matches; get returns exact public props and subpaths; compose keeps authorization/mutation in the application; validation reports no invented or private contract.

- [ ] **Step 2: Verify bundle ceilings without raising baselines**

```bash
pnpm build:packages
pnpm bundle:check -- --stage stage-2 --json .artifacts/bundles/stage-2.json
```

Expected: all packages remain within the immutable `stage-2` roadmap allocation committed in Stage 0, and `.artifacts/bundles/stage-2.json` lists every package, new entrypoint, measured gzip delta, allocation, and pass/fail result. A failure is fixed by reducing output; this plan never edits, rebases, or raises the Stage 0 allocation.

- [ ] **Step 3: Run affected and full clean-consumer matrices**

```bash
pnpm fixtures:compat -- --fixture member-moderation --cell vite-react-19 --manager pnpm-11
pnpm fixtures:compat -- --fixture member-moderation --all
```

Expected: the one Stage 0 engine selects the registered `member-moderation` source; all seven documented framework cells install nine packed artifacts with npm 10/11, pnpm 10/11, or Yarn 4 `node_modules` as defined by the Stage 0 matrix; the Stage 2 scenario typechecks, builds, and renders without workspace aliases or deep imports.

- [ ] **Step 4: Record automated and manual accessibility evidence**

Write `docs/accessibility/evidence/stage-2-interactions.md` with fields `date`, `tester`, `OS`, `browser`, `AT`, `component`, `scenario`, `result`, and `issue link`. Automated evidence records the three Playwright engines. Release-cadence rows for Safari/VoiceOver, Chrome/NVDA, and real iOS Safari remain explicitly `not executed: owner authorization required` until actually performed; do not convert an automated result into an AT claim.

- [ ] **Step 5: Add the normal Stage 2 Changeset**

```md
---
"@unpopping-candy/ui": minor
"@unpopping-candy/knowledge": minor
"@unpopping-candy/registry": minor
"@unpopping-candy/cli": minor
"@unpopping-candy/mcp": minor
---

Add accessible menus, popovers, tooltips, disclosures, and accordions, plus the member-moderation workflow contract and generated agent guidance.
```

Do not list private `@unpopping-candy/evals` or `@unpopping-candy/figma`.

- [ ] **Step 6: Run the complete Stage 2 gate**

```bash
npm run agent:check
npm run test:pure
npm run verify
pnpm typecheck
pnpm build
pnpm --filter @unpopping-candy/docs test
pnpm bundle:check -- --stage stage-2 --json .artifacts/bundles/stage-2.json
pnpm fixtures:compat -- --fixture member-moderation --all
git diff --check
```

Expected: every command exits 0; all Storybook interaction and axe tests pass; the build emits only expected ESM public entrypoints; no P0/P1 correctness, accessibility, package-resolution, or documentation defect remains.

- [ ] **Step 7: Stage the exact beta candidate without publishing**

Run:

```bash
pnpm release:candidate -- --version 0.3.0-beta.0 --channel next --out .artifacts/releases/stage-2-beta.0
```

Expected: the command exits 0 without network publication, keeps the normal Stage 2 Changeset in source, and writes exactly nine package tarballs plus a candidate manifest, SHA-256 digests, compatibility mapping, provenance, and verification receipt under `.artifacts/releases/stage-2-beta.0`. Every packed manifest and provenance record says `0.3.0-beta.0`, the candidate manifest says channel `next`, and private `evals` and `figma` packages are absent. The source catalog/component metadata continues to say `version: "0.3.0"` and `status: "beta"` because that is the API-introduction target, not candidate provenance.

Do not run npm publish, change a dist-tag, upload the candidate, or mutate repository settings. The project owner must inspect the nine-pack manifest, digests, provenance, bundle receipt, compatibility receipt, and external authorization record before separately approving publication.

- [ ] **Step 8: Review before any release action**

Invoke `superpowers:requesting-code-review`, then run the repository browser/visual QA workflow over every changed story in Chromium, Firefox, and WebKit. Review the exact generated component docs and temporary Figma Code Connect mappings. Stop before Chromatic spend, real-device/AT services, npm publish, Pages deployment, or changing repository settings unless the owner authorizes that exact action.

- [ ] **Step 9: Commit source evidence while leaving candidate artifacts unstaged**

```bash
git add .changeset/stage-two-interactions.md docs/accessibility/evidence/stage-2-interactions.md packages/knowledge/src/generated agent DESIGN.md packages/registry/src/registry.json figma/code-connect
git diff --staged --check
git commit -m "docs: prepare stage two beta candidate"
```

Expected: the normal Stage 2 Changeset and generated source evidence are committed; `config/bundle-budgets.json`, `.artifacts/bundles/stage-2.json`, and `.artifacts/releases/stage-2-beta.0` are not staged or rewritten by this commit.

## Stage 2 Definition of Done

- All eleven public component IDs resolve for the actual installed beta package set and expose no React Aria type or prop name; source metadata says `version: "0.3.0"` and `status: "beta"`, while candidate manifests and provenance say `0.3.0-beta.0`.
- Menu keyboard traversal, grouped checkbox/radio semantics, Escape, outside dismissal, and trigger focus restoration pass in browser tests and RTL stories.
- Popover focus containment/dismissal and Tooltip focus/hover behavior pass interaction and axe checks.
- Disclosure and Accordion pass controlled/uncontrolled, disabled, single/multiple, keyboard, RTL, and semantic role/state checks.
- The moderation workflow distinguishes safe and destructive actions, presents permission denial, and preserves context through app-owned pending and error states.
- Generated catalog, agent documents, Storybook manifest, Registry receipt data, deterministic evals, and internal Figma templates are current.
- The registered `member-moderation` fixture passes the single Stage 0 compatibility engine's focused cell and full matrix from nine packed public packages.
- The immutable Stage 0 `stage-2` bundle allocation, package builds, and the full repository gate pass, with the JSON receipt retained under `.artifacts/bundles/stage-2.json`.
- `pnpm release:candidate -- --version 0.3.0-beta.0 --channel next --out .artifacts/releases/stage-2-beta.0` stages exactly nine verified packs locally and publishes nothing.
- External browser/AT, visual, publication, and hosting actions remain honestly recorded as executed or authorization-gated.
- Stage 3 cannot start until every Stage 2 Definition of Done item above passes and the resulting evidence is reviewed; publication approval is not required to begin Stage 3, but a failed or incomplete local candidate gate is blocking.
