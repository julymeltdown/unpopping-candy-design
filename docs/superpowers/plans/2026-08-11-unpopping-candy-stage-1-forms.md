# Unpopping Candy Stage 1 Forms Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish an accessible form-and-choice family and prove it through the application-owned publish-a-post audience workflow.

**Architecture:** `@unpopping-candy/ui` wraps React Aria Components 1.20.0 behind Unpopping Candy names, semantic tokens, and stable `data-popcandy-*` hooks. Static JSX collections share one public `CollectionKey`/`CollectionSelection` contract, while form state, submission, filtering, and publishing remain in the consumer. Every named component is independently cataloged and exercised in Storybook; the stage then proves packed-package consumption and the flagship workflow.

**Tech Stack:** React 18.3/19, TypeScript, React Aria Components 1.20.0, Vite 8, Storybook 10.5, Vitest 4 browser mode, Playwright, axe, pnpm 11, Changesets.

## Global Constraints

- Complete Stage 0 and begin from its green prerelease candidate; do not bypass its Storybook browser harness, clean-package runner, bundle budget, or compatibility manifest.
- Public brand: `Unpopping Candy`; public command: `popcandy`; do not introduce `commonspace` names.
- Public packages remain `tokens`, `theme`, `icons`, `ui`, `social`, `knowledge`, `registry`, `cli`, and `mcp`; `evals` and `figma` remain private repository tooling.
- React peer range is `>=18.3 <20`; Node runtime is 22.13+ and 24.x; declarations must compile with TypeScript 5.7+.
- Published packages are ESM with explicit `exports`; undocumented source and `dist` imports are unsupported.
- React Aria Components is internal behavior infrastructure. Do not export its types, `isSelected` naming, render props, slot protocol, class names, or data attributes.
- Presentation packages do not own fetching, routing, authentication, authorization, mutations, caches, API DTOs, or publish workflow state.
- Use semantic `--popcandy-*` tokens, `.popcandy-*` classes, and stable `data-popcandy-*` attributes. Do not add a recipes DSL or a public universal `Field` component.
- New controls contain no hardcoded visible English. Labels, descriptions, errors, empty text, and pending text are supplied by the consumer.
- Preserve native `name`, `value`, `form`, `required`, reset, constraint-validation, and `FormData` behavior. Forward the documented outer element ref and expose `inputRef` or `triggerRef` where an inner native control owns focus.
- Support controlled and uncontrolled state only where the native/RAC interaction supports both. Controlled callbacks never mutate application state internally.
- Accessibility target is WCAG 2.2 AA. Required evidence includes keyboard interaction, focus-visible, accessible names, error association, color-independent state, RTL, 400% reflow, touch targets, reduced motion, and automated axe.
- Generated catalog, manifest, agent-doc, Registry, eval, and Figma files are regenerated from source and never edited directly.
- Compatibility scenarios are copied alone into clean temporary consumers; they import only React and public `@unpopping-candy/*` package entrypoints, never repository-relative files, application files, workspace aliases, source paths, or `dist` internals.
- Stage 1 stages the exact `0.3.0-alpha.1` candidate under `next`; npm publication, Chromatic spend, and hosted publication still require owner authorization.
- Component metadata uses `version: "0.3.0"` to record the intended stable introduction. Candidate package provenance is `0.3.0-alpha.1`; do not rewrite source package versions or enter Changesets prerelease mode to produce it.

---

## Public API contract

All public symbols below are exported from both `@unpopping-candy/ui` and `@unpopping-candy/ui/forms`. `ref` targets are part of the contract even though React models them outside the props interfaces.

```ts
export type CollectionKey = string | number;
export type CollectionSelection = "all" | ReadonlySet<CollectionKey>;
export type FormValidationBehavior = "aria" | "native";

export interface CheckboxProps {
  children: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  name?: string;
  value?: string;
  form?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  validationBehavior?: FormValidationBehavior;
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
  style?: CSSProperties;
}

export interface CheckboxGroupProps {
  children: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  name?: string;
  form?: string;
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  validationBehavior?: FormValidationBehavior;
  className?: string;
  style?: CSSProperties;
}

export interface RadioProps {
  children: ReactNode;
  description?: ReactNode;
  value: string;
  disabled?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
  style?: CSSProperties;
}

export interface RadioGroupProps {
  children: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  name?: string;
  form?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  validationBehavior?: FormValidationBehavior;
  className?: string;
  style?: CSSProperties;
}

export interface SwitchProps {
  children: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  name?: string;
  value?: string;
  form?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  validationBehavior?: FormValidationBehavior;
  inputRef?: RefObject<HTMLInputElement | null>;
  className?: string;
  style?: CSSProperties;
}

export interface CollectionItemProps {
  id: CollectionKey;
  textValue: string;
  children: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface CollectionSectionProps {
  id?: CollectionKey;
  label: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface ListBoxProps {
  children: ReactNode;
  label?: ReactNode;
  ariaLabel?: string;
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: CollectionSelection;
  defaultSelectedKeys?: CollectionSelection;
  onSelectionChange?: (selection: CollectionSelection) => void;
  disabledKeys?: Iterable<CollectionKey>;
  emptyContent?: ReactNode;
  pending?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface ListBoxItemProps extends CollectionItemProps {}
export interface ListBoxSectionProps extends CollectionSectionProps {}

export interface SelectProps {
  children: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  placeholder?: ReactNode;
  emptyContent?: ReactNode;
  name?: string;
  form?: string;
  value?: CollectionKey | null;
  defaultValue?: CollectionKey | null;
  onValueChange?: (value: CollectionKey | null) => void;
  disabledKeys?: Iterable<CollectionKey>;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  pending?: boolean;
  validationBehavior?: FormValidationBehavior;
  triggerRef?: RefObject<HTMLButtonElement | null>;
  className?: string;
  style?: CSSProperties;
}

export interface SelectItemProps extends CollectionItemProps {}
export interface SelectSectionProps extends CollectionSectionProps {}

export interface ComboBoxProps {
  children: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  emptyContent?: ReactNode;
  name?: string;
  form?: string;
  value?: CollectionKey | null;
  defaultValue?: CollectionKey | null;
  onValueChange?: (value: CollectionKey | null) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  allowsCustomValue?: boolean;
  disabledKeys?: Iterable<CollectionKey>;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  pending?: boolean;
  validationBehavior?: FormValidationBehavior;
  inputRef?: RefObject<HTMLInputElement | null>;
  triggerRef?: RefObject<HTMLButtonElement | null>;
  className?: string;
  style?: CSSProperties;
}
```

`ListBoxItem` and `ListBoxSection` are the collection children for `ComboBox`; `Select` uses `SelectItem` and `SelectSection`. Item refs target `HTMLDivElement`, section refs target `HTMLElement`, `ListBox` refs target `HTMLDivElement`, and field wrapper refs target `HTMLDivElement`. Checkbox, Radio, and Switch outer refs target their rendered `HTMLLabelElement`.

## File responsibility map

| Responsibility                         | Files                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RAC dependency and public shared types | `packages/ui/package.json`, `pnpm-lock.yaml`, `packages/ui/vite.config.ts`, `scripts/verify-boundaries.mjs`, `packages/ui/src/form-types.ts`                                                                                                                                                                                                                                 |
| Checkbox family                        | `packages/ui/src/checkbox/checkbox.tsx`, `checkbox.docs.ts`, `checkbox-group.docs.ts`                                                                                                                                                                                                                                                                                        |
| Radio family                           | `packages/ui/src/radio/radio.tsx`, `radio.docs.ts`, `radio-group.docs.ts`                                                                                                                                                                                                                                                                                                    |
| Switch                                 | `packages/ui/src/switch/switch.tsx`, `switch.docs.ts`                                                                                                                                                                                                                                                                                                                        |
| ListBox family                         | `packages/ui/src/list-box/list-box.tsx`, `list-box.docs.ts`, `list-box-item.docs.ts`, `list-box-section.docs.ts`                                                                                                                                                                                                                                                             |
| Select family                          | `packages/ui/src/select/select.tsx`, `select.docs.ts`, `select-item.docs.ts`, `select-section.docs.ts`                                                                                                                                                                                                                                                                       |
| ComboBox                               | `packages/ui/src/combo-box/combo-box.tsx`, `combo-box.docs.ts`                                                                                                                                                                                                                                                                                                               |
| Public entrypoints                     | `packages/ui/src/forms.ts`, `packages/ui/src/index.ts`                                                                                                                                                                                                                                                                                                                       |
| Tokens and visual contract             | `packages/tokens/src/tokens.json`, `packages/tokens/src/tokens.ts`, `packages/tokens/src/styles.css`, `packages/ui/src/styles.css`, `packages/tokens/test/tokens.test.ts`                                                                                                                                                                                                    |
| Storybook contracts                    | twelve files under `apps/docs/stories/catalog/ui/` named after the twelve public components                                                                                                                                                                                                                                                                                  |
| Publish-a-post workflow                | `packages/social/src/post-composer/post-composer-view.tsx`, its metadata, `apps/docs/stories/catalog/fixtures.tsx`, `apps/docs/stories/catalog/social/PostComposerView.stories.tsx`, `apps/docs/stories/Forms.stories.tsx`, `packages/knowledge/content/patterns/pattern-form-actions.docs.ts`                                                                               |
| Generated truth                        | `scripts/generate-knowledge.mjs`, `scripts/verify-story-manifest.mjs`, `agent/**`, `packages/knowledge/src/generated/catalog.ts`, `packages/registry/src/registry.json`, `packages/evals/fixtures/**`, `figma/manifest.json`, `figma/code-connect/**`                                                                                                                        |
| Compatibility and release evidence     | Replace the Stage 0 fallback in `fixtures/compatibility/scenarios/publish-post.tsx` with a self-contained public-package consumer and commit it with `.changeset/stage-1-forms.md`; generate ignored evidence at `.artifacts/bundles/stage-1.json` and stage ignored candidate packs under `.artifacts/releases/stage-1-alpha.1/` without adding either artifact path to Git |

### Task 1: Add the RAC boundary and shared form types

**Files:**

- Create: `packages/ui/src/form-types.ts`
- Modify: `packages/ui/package.json`, `pnpm-lock.yaml`, `packages/ui/vite.config.ts`, `scripts/verify-boundaries.mjs`
- Test: `tests/architecture/build-config.test.mjs`, `tests/architecture/inspection.test.mjs`

**Interfaces:**

- Consumes: Stage 0's package/export verification.
- Produces: `CollectionKey`, `CollectionSelection`, `FormValidationBehavior`, internal `ChoiceFieldSupportProps`, and an externalized `react-aria-components@1.20.0` runtime dependency.

- [ ] **Step 1: Prove the component responsibilities are absent**

```bash
npm run popcandy -- search "checkbox group form choices" --json
npm run popcandy -- search "select searchable choice list" --json
npm run popcandy -- compose "publish a post with audience, reply, and publishing choices" --json
```

Expected: the installed catalog reports the Stage 1 controls as unsupported and does not invent imports or props.

- [ ] **Step 2: Write the failing dependency-boundary tests**

Add assertions that `react-aria-components` is allowed only in `ui`, appears in `ui.dependencies` at exact version `1.20.0`, and is listed in Vite `rollupOptions.external`. Also assert the public source does not contain imports of `react-aria-components` types in `forms.ts` or `index.ts`.

Run: `node --test tests/architecture/build-config.test.mjs tests/architecture/inspection.test.mjs`

Expected: FAIL because the dependency and boundary do not exist.

- [ ] **Step 3: Add the dependency, externalization, and types**

```ts
// packages/ui/src/form-types.ts
import type { CSSProperties, ReactNode } from "react";

export type CollectionKey = string | number;
export type CollectionSelection = "all" | ReadonlySet<CollectionKey>;
export type FormValidationBehavior = "aria" | "native";

export interface ChoiceFieldSupportProps {
  label: ReactNode;
  description?: ReactNode | undefined;
  error?: ReactNode | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  invalid?: boolean | undefined;
  validationBehavior?: FormValidationBehavior | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}
```

Add `"react-aria-components": "1.20.0"` to `dependencies`, add the package to the UI boundary allowlist, add it to Vite externals, then run `pnpm install` to update the lockfile.

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @unpopping-candy/ui typecheck
node --test tests/architecture/build-config.test.mjs tests/architecture/inspection.test.mjs
git add packages/ui/package.json pnpm-lock.yaml packages/ui/vite.config.ts packages/ui/src/form-types.ts scripts/verify-boundaries.mjs tests/architecture/build-config.test.mjs tests/architecture/inspection.test.mjs
git commit -m "build(ui): add React Aria form foundation"
```

Expected: all commands exit 0 and `pnpm why react-aria-components --filter @unpopping-candy/ui` resolves exactly 1.20.0.

### Task 2: Establish choice and collection tokens

**Files:**

- Modify: `packages/tokens/src/tokens.json`, `packages/tokens/src/tokens.ts`, `packages/tokens/src/styles.css`, `packages/ui/src/styles.css`
- Test: `packages/tokens/test/tokens.test.ts`

**Interfaces:**

- Consumes: semantic color, spacing, radius, focus, density, and motion tokens.
- Produces: `--popcandy-choice-size`, `--popcandy-collection-option-height`, and `--popcandy-collection-popover-max-height` plus state styles for all Stage 1 controls.

- [ ] **Step 1: Write the failing token assertions**

```ts
test("choice and collection dimensions stay synchronized across token outputs", () => {
  assert.equal(componentTokens.choice.size, "1.125rem");
  assert.equal(componentTokens.collection.optionHeight, "2.5rem");
  assert.equal(componentTokens.collection.popoverMaxHeight, "20rem");
});
```

Run: `pnpm --filter @unpopping-candy/tokens test`

Expected: FAIL because `choice` and `collection` are absent.

- [ ] **Step 2: Add the canonical token values and CSS states**

Add the three values to DTCG JSON, typed tokens, and CSS variables. Style only `.popcandy-*` selectors and RAC-generated states mapped by the wrapper to `data-popcandy-state`, `data-popcandy-selected`, `data-popcandy-focus-visible`, `data-popcandy-disabled`, `data-popcandy-invalid`, `data-popcandy-pending`, and `data-popcandy-direction`.

Required CSS behavior: 44px minimum touch target in comfortable density; compact mode never reduces the interactive hit area below 40px; focus uses `--popcandy-focus`; selected/invalid states have non-color indicators; overlay height uses the collection max-height token; logical properties handle RTL; motion durations become zero under the existing reduced-motion media query.

- [ ] **Step 3: Verify and commit**

```bash
pnpm --filter @unpopping-candy/tokens test
node scripts/verify-css-contract.mjs
git add packages/tokens/src/tokens.json packages/tokens/src/tokens.ts packages/tokens/src/styles.css packages/tokens/test/tokens.test.ts packages/ui/src/styles.css
git commit -m "feat(tokens): add choice and collection contracts"
```

Expected: both commands exit 0; no literal color, spacing, radius, shadow, or gradient is added to UI CSS where a semantic token exists.

### Task 3: Implement Checkbox and CheckboxGroup

**Files:**

- Create: `packages/ui/src/checkbox/checkbox.tsx`, `checkbox.docs.ts`, `checkbox-group.docs.ts`
- Create: `apps/docs/stories/catalog/ui/Checkbox.stories.tsx`, `CheckboxGroup.stories.tsx`
- Modify: `packages/ui/src/forms.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `ChoiceFieldSupportProps` and non-deprecated RAC `CheckboxField` + `CheckboxButton` + `CheckboxGroup` primitives.
- Produces: public `Checkbox`, `CheckboxProps`, `CheckboxGroup`, and `CheckboxGroupProps` exactly as declared above.

- [ ] **Step 1: Add red Storybook contracts**

Create controlled and native-form stories. The interaction must click a checkbox, submit the form, and assert `FormData.getAll('distribution')` equals `['members']`; another interaction must focus by keyboard, toggle with Space, reset the form, and observe the uncontrolled default restored. Include checked, unchecked, indeterminate, hover, focus-visible, disabled, invalid, required, long-label, RTL, dark, high-contrast, and reduced-motion story variants.

Run: `pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Checkbox.stories.tsx apps/docs/stories/catalog/ui/CheckboxGroup.stories.tsx`

Expected: FAIL because the public exports do not exist.

- [ ] **Step 2: Implement the wrapper without leaking RAC names**

```tsx
<RacCheckboxField
  name={name}
  value={value}
  form={form}
  isSelected={checked}
  defaultSelected={defaultChecked}
  onChange={onCheckedChange}
  isInvalid={invalid || Boolean(error)}
  validationBehavior={validationBehavior}
  inputRef={inputRef}
>
  <RacCheckboxButton>
    {({ isSelected, isIndeterminate }) => (
      <CheckboxIndicator checked={isSelected} indeterminate={isIndeterminate} />
    )}
    {children}
  </RacCheckboxButton>
  {description ? <Text slot="description">{description}</Text> : null}
  {error ? <FieldError>{error}</FieldError> : null}
</RacCheckboxField>
```

Map every public Boolean to the RAC equivalent, expose only Unpopping Candy data hooks, and forward the outer label/div refs documented in the API contract. Group values remain `string[]` so native form submission repeats the group name.

- [ ] **Step 3: Add canonical metadata**

Use IDs `ui.checkbox` and `ui.checkbox-group`, metadata version `0.3.0`, entrypoints `@unpopping-candy/ui` and `@unpopping-candy/ui/forms`, exact source paths, tokens from Task 2, form/keyboard/a11y requirements, and story IDs `catalog-ui-checkbox--contract` and `catalog-ui-checkbox-group--contract`. Preferred examples use `checked`/`onCheckedChange` and `value`/`onValueChange`; avoid examples explain that server persistence stays in the app.

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Checkbox.stories.tsx apps/docs/stories/catalog/ui/CheckboxGroup.stories.tsx
git add packages/ui/src/checkbox packages/ui/src/forms.ts packages/ui/src/index.ts apps/docs/stories/catalog/ui/Checkbox.stories.tsx apps/docs/stories/catalog/ui/CheckboxGroup.stories.tsx
git commit -m "feat(ui): add checkbox choice controls"
```

Expected: typecheck and browser tests pass, including axe through Storybook's `a11y.test = 'error'` setting.

### Task 4: Implement Radio, RadioGroup, and Switch

**Files:**

- Create: `packages/ui/src/radio/radio.tsx`, `radio.docs.ts`, `radio-group.docs.ts`
- Create: `packages/ui/src/switch/switch.tsx`, `switch.docs.ts`
- Create: `apps/docs/stories/catalog/ui/Radio.stories.tsx`, `RadioGroup.stories.tsx`, `Switch.stories.tsx`
- Modify: `packages/ui/src/forms.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: non-deprecated RAC Field/Button pairs and the public naming contract.
- Produces: `Radio`, `RadioGroup`, `Switch` and their declared props; no standalone controlled state on `Radio`.

- [ ] **Step 1: Add red keyboard and form stories**

RadioGroup interaction: Tab into the group, use ArrowRight in LTR and ArrowLeft in RTL to select the next logical option, assert roving focus and submitted `publishTiming=now`, then reset to the default. Switch interaction: activate with Space, assert `aria-checked`, submit `allowReplies=yes`, reset, and verify disabled/read-only controls do not change. Cover horizontal/vertical, long content, required/invalid, disabled, focus-visible, dark, high-contrast, and reduced motion.

Run: `pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Radio.stories.tsx apps/docs/stories/catalog/ui/RadioGroup.stories.tsx apps/docs/stories/catalog/ui/Switch.stories.tsx`

Expected: FAIL on missing exports.

- [ ] **Step 2: Implement minimal wrappers**

Use `RacRadioGroup`, `RacRadioField`, `RacRadioButton`, `RacSwitchField`, and `RacSwitchButton`. Map group `value/defaultValue/onValueChange` to RAC selection, map Switch `checked/defaultChecked/onCheckedChange`, pass `name`, `value`, `form`, validation, and inner `inputRef`, and forward documented outer refs. Preserve direction by inheriting the consumer document `dir`; do not add a locale singleton.

- [ ] **Step 3: Add metadata and public exports**

Use IDs `ui.radio`, `ui.radio-group`, and `ui.switch`, metadata version `0.3.0`, and story IDs derived from their filenames and `Contract` exports. Metadata must state native roles, arrow-key direction, Space activation, form reset, group ownership, and the requirement that visible labels and errors are consumer supplied.

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Radio.stories.tsx apps/docs/stories/catalog/ui/RadioGroup.stories.tsx apps/docs/stories/catalog/ui/Switch.stories.tsx
git add packages/ui/src/radio packages/ui/src/switch packages/ui/src/forms.ts packages/ui/src/index.ts apps/docs/stories/catalog/ui/Radio.stories.tsx apps/docs/stories/catalog/ui/RadioGroup.stories.tsx apps/docs/stories/catalog/ui/Switch.stories.tsx
git commit -m "feat(ui): add radio and switch controls"
```

Expected: all commands pass with no axe violations or focus loss.

### Task 5: Implement ListBox, ListBoxItem, and ListBoxSection

**Files:**

- Create: `packages/ui/src/list-box/list-box.tsx`, `list-box.docs.ts`, `list-box-item.docs.ts`, `list-box-section.docs.ts`
- Create: `apps/docs/stories/catalog/ui/ListBox.stories.tsx`, `ListBoxItem.stories.tsx`, `ListBoxSection.stories.tsx`
- Modify: `packages/ui/src/forms.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `CollectionKey`, `CollectionSelection`, and RAC collection primitives.
- Produces: reusable static JSX collection children for standalone ListBox and ComboBox.

- [ ] **Step 1: Add red collection interactions**

The ListBox contract must select one item with ArrowDown/Enter, select multiple items with Space without losing focus, skip disabled items, exercise Home/End and typeahead, and assert section labels. Separate contracts render a long item and a labeled section. Empty and pending stories supply explicit Korean/English-neutral content through props rather than component defaults.

Run: `pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/ListBox.stories.tsx apps/docs/stories/catalog/ui/ListBoxItem.stories.tsx apps/docs/stories/catalog/ui/ListBoxSection.stories.tsx`

Expected: FAIL on missing exports.

- [ ] **Step 2: Implement and normalize selection**

```tsx
function toRacSelection(selection: CollectionSelection | undefined) {
  return selection === undefined || selection === "all"
    ? selection
    : new Set(selection);
}

function fromRacSelection(
  selection: "all" | Set<string | number>,
): CollectionSelection {
  return selection === "all" ? "all" : new Set(selection);
}
```

Render RAC `ListBox`, `ListBoxItem`, `ListBoxSection`, `Header`, and `Text`. Require either visible `label` or `ariaLabel`; throw `ListBox requires label or ariaLabel.` when neither is present. `pending` sets `aria-busy`, prevents selection changes, and preserves current items. `emptyContent` is rendered only when the collection has no items. Forward div/item/section refs and map RAC states to stable Unpopping Candy data attributes.

- [ ] **Step 3: Add metadata and exports**

Use IDs `ui.list-box`, `ui.list-box-item`, `ui.list-box-section` and metadata version `0.3.0`; document `textValue` as mandatory for typeahead and non-text children, and forbid interactive descendants inside options. Each named export gets a dedicated story ID and complete props contract.

- [ ] **Step 4: Verify and commit**

```bash
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/ListBox.stories.tsx apps/docs/stories/catalog/ui/ListBoxItem.stories.tsx apps/docs/stories/catalog/ui/ListBoxSection.stories.tsx
git add packages/ui/src/list-box packages/ui/src/forms.ts packages/ui/src/index.ts apps/docs/stories/catalog/ui/ListBox.stories.tsx apps/docs/stories/catalog/ui/ListBoxItem.stories.tsx apps/docs/stories/catalog/ui/ListBoxSection.stories.tsx
git commit -m "feat(ui): add reusable list box collections"
```

Expected: all commands pass and selection callbacks receive only the public `CollectionSelection` type.

### Task 6: Implement Select, SelectItem, SelectSection, and ComboBox

**Files:**

- Create: `packages/ui/src/select/select.tsx`, `select.docs.ts`, `select-item.docs.ts`, `select-section.docs.ts`
- Create: `packages/ui/src/combo-box/combo-box.tsx`, `combo-box.docs.ts`
- Create: `apps/docs/stories/catalog/ui/Select.stories.tsx`, `SelectItem.stories.tsx`, `SelectSection.stories.tsx`, `ComboBox.stories.tsx`
- Modify: `packages/ui/src/forms.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: Stage 1 collection types; `ComboBox` accepts only `ListBoxItem`/`ListBoxSection` children.
- Produces: single-selection form fields with controlled/uncontrolled selection; ComboBox separately controls input text.

- [ ] **Step 1: Add red interaction and native-form stories**

Select: open with trigger, navigate, skip disabled items, select, assert focus returns to trigger, Escape without change, outside close, form submission/reset, required/invalid error association, RTL, empty, pending, and long content. ComboBox: type to filter, navigate, select, clear input, control `value` and `inputValue` independently, allow a custom value only when opted in, submit/reset, and show consumer-provided empty/pending content.

Run: `pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Select.stories.tsx apps/docs/stories/catalog/ui/SelectItem.stories.tsx apps/docs/stories/catalog/ui/SelectSection.stories.tsx apps/docs/stories/catalog/ui/ComboBox.stories.tsx`

Expected: FAIL on missing exports.

- [ ] **Step 2: Implement Select with an internal overlay**

Compose RAC `Select`, `Label`, `Button`, `SelectValue`, `Popover`, and `ListBox`. Map public `value/defaultValue/onValueChange` to RAC selected-key state, pass `name` and `form` to its hidden native select, keep `pending` disabled and `aria-busy`, and forward wrapper and trigger refs. `placeholder` remains a supplied node; do not add default copy.

- [ ] **Step 3: Implement ComboBox with reusable collection children**

Compose RAC `ComboBox`, `Label`, `Input`, `Button`, `Popover`, and the public ListBox family. Map `value` to selected key and `inputValue` independently; selecting an item invokes only `onValueChange`, while typing invokes only `onInputValueChange`. Pass form/validation props, forward input/trigger/wrapper refs, and do not fetch or debounce inside the component.

- [ ] **Step 4: Add metadata and exports**

Use IDs `ui.select`, `ui.select-item`, `ui.select-section`, `ui.combo-box` and metadata version `0.3.0`. Document overlay focus/escape/outside behavior, typeahead/filter ownership, required and reset semantics, RTL behavior, no interactive option descendants, and the independent controlled values of ComboBox.

- [ ] **Step 5: Verify and commit**

```bash
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/ui/Select.stories.tsx apps/docs/stories/catalog/ui/SelectItem.stories.tsx apps/docs/stories/catalog/ui/SelectSection.stories.tsx apps/docs/stories/catalog/ui/ComboBox.stories.tsx
git add packages/ui/src/select packages/ui/src/combo-box packages/ui/src/forms.ts packages/ui/src/index.ts apps/docs/stories/catalog/ui/Select.stories.tsx apps/docs/stories/catalog/ui/SelectItem.stories.tsx apps/docs/stories/catalog/ui/SelectSection.stories.tsx apps/docs/stories/catalog/ui/ComboBox.stories.tsx
git commit -m "feat(ui): add select and combobox fields"
```

Expected: all commands pass; built declarations contain no `react-aria-components` imports in public props.

### Task 7: Complete the publish-a-post audience workflow

**Files:**

- Modify: `packages/social/src/post-composer/post-composer-view.tsx`, `packages/social/src/post-composer/post-composer-view.docs.ts`, `apps/docs/stories/catalog/fixtures.tsx`, `apps/docs/stories/catalog/social/PostComposerView.stories.tsx`, `apps/docs/stories/Forms.stories.tsx`, `packages/knowledge/content/patterns/pattern-form-actions.docs.ts`

**Interfaces:**

- Consumes: Select for audience, RadioGroup for timing, Switch for replies, CheckboxGroup for distribution preferences; all state stays in the story/consumer.
- Produces: optional `audienceControl?: ReactNode` and `publishingOptions?: ReactNode` composition slots on `PostComposerViewProps`.

- [ ] **Step 1: Extend the red flagship story**

Create a controlled `CatalogPublishPostWorkflow` with draft, audience, timing, replies, distribution, pending, success, and failure state owned by the fixture. The play function fills text, selects `members`, chooses `now`, enables replies, submits once, observes pending disabled controls, then resolves success. A second play path rejects submission, preserves every value, renders a critical error, and returns focus to the actionable retry control.

Run: `pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/social/PostComposerView.stories.tsx`

Expected: FAIL because PostComposerView has no composition slots.

- [ ] **Step 2: Add presentation-only slots**

```tsx
export interface PostComposerViewProps {
  audienceControl?: ReactNode | undefined;
  publishingOptions?: ReactNode | undefined;
}

{
  audienceControl ? (
    <div className="popcandy-composer__audience">{audienceControl}</div>
  ) : null;
}
{
  publishingOptions ? (
    <div className="popcandy-composer__publishing-options">
      {publishingOptions}
    </div>
  ) : null;
}
```

Place both inside the existing form but do not read their values, call APIs, or infer permissions. Update metadata relations to all Stage 1 controls and update the form-actions pattern components/flow with audience validation and draft preservation.

- [ ] **Step 3: Verify and commit**

```bash
pnpm --filter @unpopping-candy/social typecheck
pnpm --filter @unpopping-candy/docs test -- --run apps/docs/stories/catalog/social/PostComposerView.stories.tsx
git add packages/social/src/post-composer apps/docs/stories/catalog/fixtures.tsx apps/docs/stories/catalog/social/PostComposerView.stories.tsx apps/docs/stories/Forms.stories.tsx packages/knowledge/content/patterns/pattern-form-actions.docs.ts
git commit -m "feat(social): compose publish audience controls"
```

Expected: workflow passes default, selected, required, invalid, pending, success, failure, long-content, RTL, and narrow-canvas scenarios without package-owned business state.

### Task 8: Regenerate exact catalog and agent contracts

**Files:**

- Modify: `scripts/generate-knowledge.mjs`, `scripts/verify-story-manifest.mjs`
- Generate: `packages/knowledge/src/generated/catalog.ts`, `agent/**`, `packages/registry/src/registry.json`, `packages/evals/fixtures/**`, `figma/manifest.json`, and twelve templates under `figma/code-connect/**`.
- Test: `packages/knowledge/test/generated-catalog.test.ts`, `tests/architecture/story-contract.test.mjs`

**Interfaces:**

- Consumes: 12 new metadata records and stories.
- Produces: 44 stable public components and 44 catalog Storybook contracts; no numeric component count duplicated in verifier source.

- [ ] **Step 1: Observe the truthful generation failure**

Run: `npm run agent:check`

Expected: FAIL with stale generated files and the current hardcoded `expected 32` component/story checks.

- [ ] **Step 2: Replace hardcoded counts with catalog-derived invariants**

In knowledge generation, assert at least one stable component and uniqueness/completeness rather than a fixed integer. In story verification, compare the set of component IDs represented by stories with the stable catalog ID set. Add regression tests whose synthetic catalog has two components and two stories so a later valid addition cannot require verifier edits.

- [ ] **Step 3: Generate and inspect the exact output**

```bash
npm run agent:generate
npm run agent:check
npm run popcandy -- search "audience choice" --json
npm run popcandy -- get ui.select --json
npm run popcandy -- compose "publish a post with audience, reply, and publishing choices" --json
```

Expected: generation is byte-stable; build/catalog/story manifests report 44 components; search/get/compose return only real IDs, props, public entrypoints, tokens, and Story IDs; generated Figma entries remain non-publishable until Stage 4A maps real nodes.

- [ ] **Step 4: Commit canonical and generated files together**

```bash
git add scripts/generate-knowledge.mjs scripts/verify-story-manifest.mjs packages/knowledge/test/generated-catalog.test.ts tests/architecture/story-contract.test.mjs packages/knowledge/src/generated packages/registry/src/registry.json packages/evals/fixtures figma/manifest.json figma/code-connect agent
git commit -m "docs(agent): publish Stage 1 form contracts"
```

Expected: `git diff --staged --check` is clean before commit; the staged diff contains every knowledge, agent, Registry, eval, Figma manifest, and Code Connect output changed by `npm run agent:generate`; no generated file was hand-edited and no generated change lacks a Stage 1 source input.

### Task 9: Prove canonical compatibility, bundle budget, and release record

**Files:**

- Modify: `fixtures/compatibility/scenarios/publish-post.tsx`
- Generate, do not commit: `.artifacts/bundles/stage-1.json`
- Create: `.changeset/stage-1-forms.md`
- Stage, do not commit: `.artifacts/releases/stage-1-alpha.1/`

**Interfaces:**

- Consumes: Stage 0's canonical `fixtures:compat`, `bundle:check`, and `release:candidate` commands plus the immutable cumulative Stage 1 allocation pre-reserved in `config/bundle-budgets.json`.
- Produces: one shared publish-post scenario, compatibility evidence across the Stage 0 matrix, gzip evidence, an unconsumed normal Changeset, and exactly nine staged candidate packs.

- [ ] **Step 1: Make the Stage 1 scenario contract fail against the fallback**

Extend the existing scenario contract to require the Stage 1 audience, timing, replies, distribution, pending, success, and retained-on-failure behavior while leaving the Stage 0 fallback render in place.

Run:

```bash
pnpm fixtures:compat -- --fixture publish-post --cell vite-react-19 --manager pnpm-11
```

Expected: FAIL because the Stage 0 fallback does not render the new audience, timing, replies, and distribution controls required by the scenario assertions.

- [ ] **Step 2: Replace the fallback with a self-contained public-package consumer**

Reproduce the presentation semantics of `CatalogPublishPostWorkflow` directly in the scenario using public imports and application-owned React state/callbacks. Do not import the Storybook fixture or any repository/application-relative module.

```tsx
import { useState } from "react";
import {
  Alert,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Switch,
} from "@unpopping-candy/ui";
import {
  PostComposerView,
  type SocialUserViewModel,
} from "@unpopping-candy/social";

const viewer: SocialUserViewModel = {
  id: "fixture-viewer",
  handle: "fixture",
  displayName: "Fixture Member",
};

export function PublishPostScenario() {
  const [draft, setDraft] = useState("");
  const [audience, setAudience] = useState<string | number | null>("members");
  const [timing, setTiming] = useState("now");
  const [allowReplies, setAllowReplies] = useState(true);
  const [distribution, setDistribution] = useState<string[]>(["feed"]);
  const [status, setStatus] = useState<
    "ready" | "pending" | "failed" | "succeeded"
  >("ready");

  return (
    <PostComposerView
      viewer={viewer}
      value={draft}
      onValueChange={setDraft}
      placeholder="Write a post"
      submitLabel="Publish"
      pending={status === "pending"}
      feedback={
        status === "failed" ? (
          <Alert tone="critical" title="Publication failed" />
        ) : status === "succeeded" ? (
          <Alert tone="success" title="Publication succeeded" />
        ) : null
      }
      onSubmit={() => setStatus("pending")}
      audienceControl={
        <Select
          name="audience"
          label="Audience"
          value={audience}
          onValueChange={setAudience}
          required
        >
          <SelectItem id="members" textValue="Members">
            Members
          </SelectItem>
          <SelectItem id="public" textValue="Public">
            Public
          </SelectItem>
        </Select>
      }
      publishingOptions={
        <>
          <RadioGroup
            name="publishTiming"
            label="Publish timing"
            value={timing}
            onValueChange={setTiming}
          >
            <Radio value="now">Now</Radio>
            <Radio value="later">Later</Radio>
          </RadioGroup>
          <Switch
            name="allowReplies"
            value="yes"
            checked={allowReplies}
            onCheckedChange={setAllowReplies}
          >
            Allow replies
          </Switch>
          <CheckboxGroup
            name="distribution"
            label="Distribution"
            value={distribution}
            onValueChange={setDistribution}
          >
            <Checkbox value="feed">Member feed</Checkbox>
          </CheckboxGroup>
        </>
      }
    />
  );
}
```

Preserve the Stage 0 scenario export shape and its compile-time ref assertions for `HTMLLabelElement`, `HTMLInputElement`, `HTMLDivElement`, and `HTMLButtonElement`. Consumer-facing labels in this fixture are explicit test inputs, not component defaults. The scenario driver owns transitions from pending to succeeded or failed so the package still owns no mutation lifecycle.

- [ ] **Step 3: Prove one fast compatibility cell, then the complete matrix**

```bash
pnpm fixtures:compat -- --fixture publish-post --cell vite-react-19 --manager pnpm-11
pnpm fixtures:compat -- --fixture publish-post --all
```

Expected: the first command proves the Vite/React 19/pnpm 11 path quickly; the second exercises every valid Stage 0 framework and package-manager cell from clean packed artifacts. Every cell typechecks, builds, runs the publish workflow, verifies native form values, keyboard behavior, retained state on failure, and axe, records exact tool versions, and finds no repository/application-relative import, `workspace:` specifier, source alias, source path, or `dist` internal in the copied scenario or installed manifests.

- [ ] **Step 4: Record bundle evidence without changing ceilings**

```bash
pnpm bundle:check -- --stage stage-1 --json .artifacts/bundles/stage-1.json
```

Expected: every public package remains within the immutable cumulative Stage 1 allocation that Stage 0 reserved before implementation; `react-aria-components` is external to UI bundles; the report includes entrypoint bytes and per-component-family deltas. A breach blocks the stage and is fixed by reducing output. Stage 1 cannot edit or raise its allocation in `config/bundle-budgets.json`.

- [ ] **Step 5: Add the coordinated Changeset**

```md
---
"@unpopping-candy/tokens": minor
"@unpopping-candy/ui": minor
"@unpopping-candy/social": minor
---

Add accessible choice and collection controls and the application-owned publish-a-post audience composition.
```

- [ ] **Step 6: Keep the normal Changeset unconsumed and commit source evidence**

```bash
git add fixtures/compatibility/scenarios/publish-post.tsx .changeset/stage-1-forms.md
git commit -m "test(release): prove Stage 1 form adoption"
```

Expected: the staged diff replaces the existing Stage 0 fallback scenario with a self-contained full new-controls workflow and adds the normal Changeset; it does not introduce a second scenario or a repository/application-relative import. `.artifacts/bundles/stage-1.json` and `.artifacts/releases/stage-1-alpha.1/` remain ignored and unstaged. Do not run `changeset pre enter`, `changeset version`, `pnpm version-packages`, or any command that consumes the Changeset or rewrites source package versions.

- [ ] **Step 7: Stage the exact alpha candidate without publishing**

```bash
pnpm release:candidate -- --version 0.3.0-alpha.1 --channel next --out .artifacts/releases/stage-1-alpha.1
```

Expected: the Stage 0 candidate builder leaves the source tree and `.changeset/stage-1-forms.md` unchanged, stages exactly nine public package tarballs plus their provenance manifest, labels package provenance `0.3.0-alpha.1`, and confirms every new component metadata record uses `version: "0.3.0"` for its intended stable introduction. Do not publish these packs without explicit owner approval.

### Task 10: Run the Stage 1 exit gate

**Files:**

- Verify: every source, generated artifact, story, canonical compatibility scenario, evidence record, unconsumed Changeset, and staged candidate produced by Tasks 1–9.

**Interfaces:**

- Consumes: completed Stage 1 commits.
- Produces: reviewed, source-clean `0.3.0-alpha.1` candidate containing exactly nine packs; publication remains separately authorized.

- [ ] **Step 1: Run all deterministic repository gates**

```bash
npm run agent:check
npm run test:pure
npm run verify
pnpm typecheck
pnpm build
pnpm --filter @unpopping-candy/docs test
pnpm fixtures:compat -- --fixture publish-post --cell vite-react-19 --manager pnpm-11
pnpm fixtures:compat -- --fixture publish-post --all
pnpm bundle:check -- --stage stage-1 --json .artifacts/bundles/stage-1.json
pnpm release:candidate -- --version 0.3.0-alpha.1 --channel next --out .artifacts/releases/stage-1-alpha.1
git diff --check
```

Expected: every command exits 0, Storybook reports no axe violations, generated output is clean, compatibility passes, bundle evidence stays within the pre-reserved allocation, the candidate contains exactly nine packs, and source versions plus the Changeset remain unchanged.

- [ ] **Step 2: Inspect the canonical compatibility and candidate evidence**

Expected: the `--all` compatibility report covers every valid Stage 0 framework/package-manager cell and records exact framework, React, TypeScript, package-manager, Node, OS, and browser versions. The candidate manifest lists exactly the nine public packages, `0.3.0-alpha.1`, `next`, tarball digests, and provenance; no evals, figma, application, or source-workspace package is packed.

- [ ] **Step 3: Perform manual surface QA**

Build and serve Storybook, then use the browser workflow to exercise the flagship story at 320 CSS px and 1280 CSS px in light, dark, high-contrast, RTL, and reduced-motion modes. Verify mouse, keyboard-only, 400% zoom/reflow, long labels, empty, invalid, pending, success, and failed publication. Record VoiceOver/Safari and NVDA/Chrome evidence for the release cadence; physical iOS Safari evidence remains a release gate when the approved device/service is available.

- [ ] **Step 4: Review and stop before publication**

Invoke `superpowers:requesting-code-review`, resolve all P0/P1 correctness or accessibility findings, and confirm `git status --short` is clean. Confirm `.artifacts/bundles/stage-1.json` and `.artifacts/releases/stage-1-alpha.1/` are ignored and unstaged, then review the staged `0.3.0-alpha.1`/`next` provenance. Do not publish npm packages, deploy Storybook, or spend Chromatic budget without the owner's exact approval.

## Stage 1 definition of done

- The twelve new stable IDs are `ui.checkbox`, `ui.checkbox-group`, `ui.radio`, `ui.radio-group`, `ui.switch`, `ui.select`, `ui.select-item`, `ui.select-section`, `ui.combo-box`, `ui.list-box`, `ui.list-box-item`, and `ui.list-box-section`.
- Root and forms entrypoints export exactly the API contract in this plan, with no RAC types or undocumented deep imports in generated declarations.
- Native forms, reset, refs, controlled/uncontrolled state, i18n/RTL, keyboard, focus, invalid/required, pending, empty, disabled, long-content, and accessibility contracts have executable evidence.
- Catalog and Storybook manifests derive their count from catalog truth and report 44 stable components after generation.
- The publish-a-post workflow keeps draft, audience, timing, reply, distribution, mutation, pending, success, and failure ownership in the consuming application.
- The canonical `publish-post` scenario passes its fast Vite/React 19/pnpm 11 cell and the complete Stage 0 compatibility matrix from packed artifacts; UI and public packages remain inside the immutable cumulative Stage 1 allocation reserved by Stage 0.
- The copied compatibility scenario is self-contained, reproduces the Storybook workflow semantics with application-owned state/callbacks, and imports only React plus public `@unpopping-candy/*` entrypoints; repository/application-relative imports, workspace aliases, source paths, and `dist` internals are absent.
- The normal Changeset remains present and unconsumed, source package versions remain unchanged, and component metadata records intended stable introduction at `0.3.0`.
- `.artifacts/bundles/stage-1.json` remains ignored evidence; `.artifacts/releases/stage-1-alpha.1/` remains ignored staging output containing exactly nine `0.3.0-alpha.1` public package packs plus provenance for `next`. Neither artifact path is staged or committed, and external publication is still unexecuted.
