# Unpopping Candy Stage 3 Navigation and Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship accessible navigation and structured-activity primitives, prove the notification/activity workflow in every supported framework cell, and produce a non-publishing stable `0.3.0` release candidate.

**Architecture:** Native semantics remain native: Breadcrumbs, Pagination, Table, and Progress use platform elements with Unpopping Candy styling, while DataGrid is a separate React Aria-backed controlled grid. The workflow fixture owns fetching, routing, filters, pagination, and selection; the library owns presentation, keyboard behavior, focus, semantics, and documented state contracts.

**Tech Stack:** React 18.3/19, TypeScript, React Aria Components 1.20.0, Vite 8, Storybook 10.5, Vitest 4 browser mode, Playwright, pnpm 11, Changesets.

## Global Constraints

- Public brand: `Unpopping Candy`; public command: `popcandy`; do not introduce `commonspace` names.
- Public packages: `tokens`, `theme`, `icons`, `ui`, `social`, `knowledge`, `registry`, `cli`, and `mcp`; `evals` and `figma` remain private repository tooling.
- React peer dependency: `>=18.3 <20`; CLI and MCP runtimes: Node.js 22.13+ and 24.x; public declaration floor: TypeScript 5.7+.
- Published packages are ESM with standards-based `exports`, explicit type entry points, and no undocumented deep imports; CommonJS is unsupported in `0.3`.
- Supported consumers are npm 10/11, pnpm 10/11, and Yarn 4 with the `node_modules` linker; Yarn Plug'n'Play is unverified.
- Supported cells are Vite 8 with React 18.3 and 19; Next.js 15 App Router with React 18.3 and 19; Next.js 16 App Router with React 19; React Router 7 data router with React 18.3 and 19.
- Browser support is the latest two stable major releases at release time of Chrome, Edge, Firefox, desktop Safari, and iOS Safari.
- Accessibility target is WCAG 2.2 AA with automated axe and keyboard checks plus release-cadence Safari/VoiceOver, Chrome/NVDA, and real iOS Safari evidence.
- React Aria Components remains an implementation detail; raw React Aria types and prop bags must not enter the public API.
- UI and social packages must not own fetching, routing, authentication, authorization, mutations, server caches, API DTOs, filtering, sorting, or pagination state.
- Use semantic `--popcandy-*` tokens, `.popcandy-*` classes, and stable `data-popcandy-*` state attributes; do not hardcode a visual value when a token exists.
- Components contain no hardcoded English UI. Consumer code supplies visible labels, empty/error copy, and locale-aware value text; inherited `dir` controls RTL.
- `Table` stays native and non-interactive. `DataGrid` stays interactive and controlled. A mounted surface never switches between those contracts.
- Sorting, filtering, editing, virtualization, persistence, fetching, and server pagination are outside `0.3` DataGrid scope.
- Every public component requires a stable export and ID, typed props and ref/native behavior, adjacent metadata, Storybook states, accessibility and nonvisual tests, generated artifacts, a packed clean-consumer fixture, bundle evidence, and a Changeset.
- Stage 3 first prepares staging-only `0.3.0-beta.1` with the Stage 0 `release:candidate` flow under `next`; it does not introduce an `rc` lane. Only after every stable gate passes may accumulated normal Changesets be consumed to prepare local stable `0.3.0`; stable alone is eligible for `latest`, and neither candidate is published without explicit approval.
- Generated files are regenerated from canonical sources and never edited directly.
- Model claims require five repetitions per task/model, token and cost reporting, confidence intervals, captures no older than 30 days, and at least 90% compliance plus a 20 percentage-point improvement over no-context.
- External publication, paid services, repository settings, credentials, model runs, AT/device access, and five independent evaluators require explicit owner authorization.

---

## File and interface map

### Public UI sources

| Responsibility                                         | Files                                                                                                                                                                                        |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native breadcrumb navigation                           | `packages/ui/src/breadcrumbs/breadcrumbs.tsx`, `packages/ui/src/breadcrumbs/breadcrumbs.docs.ts`, `packages/ui/src/breadcrumbs/breadcrumb-item.docs.ts`                                      |
| Controlled page navigation and pure range calculation  | `packages/ui/src/pagination/pagination.tsx`, `packages/ui/src/pagination/pagination-model.ts`, `packages/ui/src/pagination/pagination.docs.ts`, `packages/ui/test/pagination-model.test.ts`  |
| Native non-interactive table                           | `packages/ui/src/table/table.tsx`, `packages/ui/src/table/table.docs.ts`                                                                                                                     |
| Controlled React Aria grid and selection normalization | `packages/ui/src/data-grid/data-grid.tsx`, `packages/ui/src/data-grid/data-grid-selection.ts`, `packages/ui/src/data-grid/data-grid.docs.ts`, `packages/ui/test/data-grid-selection.test.ts` |
| Native determinate/indeterminate progress              | `packages/ui/src/progress/progress.tsx`, `packages/ui/src/progress/progress.docs.ts`                                                                                                         |
| Styles and public entry points                         | `packages/ui/src/styles.css`, `packages/ui/src/index.ts`, `packages/ui/src/navigation.ts`, `packages/ui/src/data-display.ts`, `packages/ui/package.json`, `packages/ui/vite.config.ts`       |

### Contracts, workflow, and evidence

| Responsibility                                     | Files                                                                                                                                                                                                                                                 |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component contracts                                | `apps/docs/stories/catalog/ui/Breadcrumbs.stories.tsx`, `Pagination.stories.tsx`, `Table.stories.tsx`, `DataGrid.stories.tsx`, `Progress.stories.tsx`                                                                                                 |
| App-owned activity workflow and browser assertions | `apps/docs/stories/workflows/ActivityReview.stories.tsx`, `tests/browser/activity-review.spec.ts`; consumes Stage 0 `playwright.config.ts`, `@playwright/test@1.62.1`, and the Storybook `webServer` contract                                         |
| Deterministic and real-model activity tasks        | `packages/evals/src/reference-scenarios.ts`, `packages/evals/src/real/activity-review-task.ts`, `packages/evals/test/activity-review-task.test.ts`                                                                                                    |
| Packed compatibility scenario                      | `fixtures/compatibility/scenarios/activity-review.tsx`; consumes the Stage 0 canonical matrix and `scripts/run-compatibility-matrix.mjs` without duplicating either                                                                                   |
| Release scripts and tests                          | `scripts/pack-release.mjs`, `tests/architecture/pack-release.test.mjs`, `scripts/rehearse-release.mjs`, `tests/architecture/rehearse-release.test.mjs`, `scripts/verify-stable-0-3.mjs`, `tests/architecture/stable-release.test.mjs`, `package.json` |
| Release evidence                                   | `docs/evidence/0.3.0/stage-3-browser-at.json`, `docs/evidence/0.3.0/stage-3-onboarding.json`, `docs/evidence/0.3.0/stage-3-model-evals.json`, `docs/evidence/0.3.0/stage-3-release.md`                                                                |
| Generated knowledge and agent outputs              | `packages/knowledge/src/generated`, `agent`, `DESIGN.md`, `docs/agent-evals/baseline.md`                                                                                                                                                              |
| Generated Registry, Figma, and skill outputs       | `packages/registry/src/registry.json`, `figma/manifest.json`, `figma/code-connect`, `skills`                                                                                                                                                          |
| Budget and release note                            | `config/bundle-budgets.json`, `.changeset/stage-three-navigation-data.md`                                                                                                                                                                             |

### Public interfaces

```ts
export interface BreadcrumbsProps
  extends Omit<
    React.ComponentPropsWithoutRef<"nav">,
    "aria-label" | "children"
  > {
  ariaLabel: string;
  children: React.ReactNode;
}

export interface BreadcrumbItemProps
  extends React.LiHTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  isCurrent?: boolean;
  separator?: React.ReactNode;
}

export interface PaginationProps
  extends Omit<
    React.ComponentPropsWithoutRef<"nav">,
    "aria-label" | "onChange"
  > {
  ariaLabel: string;
  page: number;
  pageCount: number;
  onPageChange(page: number): void;
  previousLabel: React.ReactNode;
  nextLabel: React.ReactNode;
  getPageAriaLabel(page: number, isCurrent: boolean): string;
  siblingCount?: 0 | 1 | 2;
  disabled?: boolean;
}

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  caption: React.ReactNode;
  hideCaption?: boolean;
}

export type DataGridKey = string | number;
export interface DataGridColumn<TRow> {
  id: string;
  header: React.ReactNode;
  isRowHeader?: boolean;
  render(row: TRow): React.ReactNode;
}
export type DataGridSelectionProps =
  | { selectionMode?: "none"; selectedKeys?: never; onSelectionChange?: never }
  | {
      selectionMode: "single" | "multiple";
      selectedKeys: ReadonlySet<DataGridKey>;
      onSelectionChange(keys: ReadonlySet<DataGridKey>): void;
    };
export type DataGridProps<TRow> = {
  ariaLabel: string;
  columns: readonly DataGridColumn<TRow>[];
  rows: readonly TRow[];
  getRowKey(row: TRow): DataGridKey;
  disabledKeys?: ReadonlySet<DataGridKey>;
  emptyContent?: React.ReactNode;
  className?: string;
} & DataGridSelectionProps;

export interface ProgressProps
  extends Omit<
    React.ProgressHTMLAttributes<HTMLProgressElement>,
    "children" | "value"
  > {
  label: React.ReactNode;
  ariaLabel?: string;
  value?: number;
  valueText?: string;
}
```

`BreadcrumbItem` contains an application-supplied anchor or router link; `isCurrent` produces a non-link current crumb with `aria-current="page"`. Pagination is controlled and invokes application navigation. `Table` forwards an `HTMLTableElement` ref and accepts native `thead`, `tbody`, `th`, and `td` children. `DataGrid` is a generic `forwardRef` component whose ref is `HTMLDivElement`; it exposes only explicit string/number keys, converts React Aria's internal `all` selection to the current row-key set, and never owns sort/filter/page state. `Progress` forwards an `HTMLProgressElement` ref; omitted `value` means indeterminate.

## Task 1: Establish the Stage 3 execution baseline

**Files:**

- Read: `docs/superpowers/specs/2026-08-10-unpopping-candy-competitive-library-design.md`
- Read: `docs/COMPONENT_GUIDELINES.md`
- Read: `skills/author-popcandy-component/SKILL.md`

**Interfaces:**

- Consumes: passing Stage 0, Stage 1, and Stage 2 gates; React Aria Components 1.20.0 already configured as an internal implementation dependency.
- Produces: a clean, verified Stage 2 base and evidence that Stage 3 IDs do not yet exist.

- [ ] **Step 1: Inspect the installed catalog before authoring**

```bash
npm run popcandy -- info --path . --json
npm run popcandy -- search "notification activity navigation pagination structured data" --json
npm run popcandy -- compose "notification activity review with loading empty error pending pagination and controlled selection" --json
npm run popcandy -- get social.notification-item --json
npm run popcandy -- get pattern.collection-states --json
```

Expected: the project and exact catalog version resolve; current components are reported truthfully; Stage 3 IDs are absent before their sources are added.

- [ ] **Step 2: Verify the complete Stage 2 base**

```bash
npm run agent:check
npm run test:pure
npm run verify
pnpm typecheck
pnpm build
pnpm --filter @unpopping-candy/docs test
```

Expected: all six commands exit 0 before Stage 3 source changes.

- [ ] **Step 3: Record the absent contracts**

```bash
npm run popcandy -- get ui.pagination --json
npm run popcandy -- get ui.data-grid --json
```

Expected: both commands fail with the stable catalog not-found diagnostic. This is the intentional pre-implementation observation, not a baseline regression.

## Task 2: Implement Breadcrumbs and controlled Pagination

**Files:**

- Create: `packages/ui/src/breadcrumbs/breadcrumbs.tsx`
- Create: `packages/ui/src/breadcrumbs/breadcrumbs.docs.ts`
- Create: `packages/ui/src/breadcrumbs/breadcrumb-item.docs.ts`
- Create: `packages/ui/src/pagination/pagination.tsx`
- Create: `packages/ui/src/pagination/pagination-model.ts`
- Create: `packages/ui/src/pagination/pagination.docs.ts`
- Create: `packages/ui/src/navigation.ts`
- Create: `apps/docs/stories/catalog/ui/Breadcrumbs.stories.tsx`
- Create: `apps/docs/stories/catalog/ui/Pagination.stories.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles.css`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/vite.config.ts`
- Test: `packages/ui/test/pagination-model.test.ts`

**Interfaces:**

- Consumes: `createPaginationItems(page: number, pageCount: number, siblingCount: 0 | 1 | 2): readonly (number | 'ellipsis')[]`.
- Produces: `Breadcrumbs`, `BreadcrumbItem`, `Pagination`, their public prop types, root/subpath exports `@unpopping-candy/ui` and `@unpopping-candy/ui/navigation`, and IDs `ui.breadcrumbs`, `ui.breadcrumb-item`, `ui.pagination`.

- [ ] **Step 1: Write and observe the pagination range test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createPaginationItems } from "../src/pagination/pagination-model.ts";

test("pagination keeps boundaries and a stable window", () => {
  assert.deepEqual(createPaginationItems(5, 10, 1), [
    1,
    "ellipsis",
    4,
    5,
    6,
    "ellipsis",
    10,
  ]);
  assert.deepEqual(createPaginationItems(1, 3, 1), [1, 2, 3]);
});

test("pagination rejects invalid controlled values", () => {
  assert.throws(
    () => createPaginationItems(0, 4, 1),
    /page must be between 1 and pageCount/,
  );
  assert.throws(
    () => createPaginationItems(1, 0, 1),
    /pageCount must be at least 1/,
  );
});
```

Run: `node --experimental-strip-types --test packages/ui/test/pagination-model.test.ts`

Expected: FAIL because `pagination-model.ts` does not exist.

- [ ] **Step 2: Implement the pure range function**

```ts
export type PaginationItem = number | "ellipsis";

export function createPaginationItems(
  page: number,
  pageCount: number,
  siblingCount: 0 | 1 | 2,
): readonly PaginationItem[] {
  if (pageCount < 1) throw new RangeError("pageCount must be at least 1.");
  if (page < 1 || page > pageCount)
    throw new RangeError("page must be between 1 and pageCount.");
  const visible = new Set([1, pageCount]);
  for (
    let value = page - siblingCount;
    value <= page + siblingCount;
    value += 1
  ) {
    if (value > 1 && value < pageCount) visible.add(value);
  }
  const ordered = [...visible].sort((left, right) => left - right);
  return ordered.flatMap((value, index) => {
    const previous = ordered[index - 1];
    return previous !== undefined && value - previous > 1
      ? ["ellipsis", value]
      : [value];
  });
}
```

- [ ] **Step 3: Run the focused unit test**

Run: `node --experimental-strip-types --test packages/ui/test/pagination-model.test.ts`

Expected: PASS.

- [ ] **Step 4: Implement native breadcrumb semantics**

```tsx
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
  function Breadcrumbs({ ariaLabel, children, className, ...props }, ref) {
    return (
      <nav
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        className={mergeClassNames("popcandy-breadcrumbs", className)}
        data-popcandy-component="breadcrumbs"
      >
        <ol>{children}</ol>
      </nav>
    );
  },
);

export const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem(
    { children, className, isCurrent = false, separator = "/", ...props },
    ref,
  ) {
    return (
      <li
        {...props}
        ref={ref}
        className={mergeClassNames("popcandy-breadcrumb-item", className)}
        aria-current={isCurrent ? "page" : undefined}
        data-popcandy-current={isCurrent || undefined}
      >
        <span
          aria-hidden="true"
          className="popcandy-breadcrumb-item__separator"
        >
          {separator}
        </span>
        {children}
      </li>
    );
  },
);
```

The first separator is hidden with CSS. Contract stories use an application-owned `<a>` for prior crumbs and text for the current crumb, then repeat under `dir="rtl"`.

- [ ] **Step 5: Implement controlled Pagination**

Render one `<nav><ol>` with native buttons. Previous and next buttons use consumer-supplied labels, current page has `aria-current="page"`, disabled boundary controls cannot fire, ellipses are `aria-hidden`, and every click calls `onPageChange` only for a different valid page. Do not add arrow-key interception; native Tab/Shift+Tab behavior is the documented focus model.

```tsx
const items = createPaginationItems(page, pageCount, siblingCount);
const activate = (nextPage: number) => {
  if (!disabled && nextPage >= 1 && nextPage <= pageCount && nextPage !== page)
    onPageChange(nextPage);
};
```

- [ ] **Step 6: Add metadata and contract stories**

Metadata must declare entrypoints, stable IDs, semantic tokens, native/ref behavior, LTR/RTL guidance, no routing ownership, and Pagination's controlled state. `breadcrumbs.docs.ts` documents `ui.breadcrumbs`; `breadcrumb-item.docs.ts` separately documents exported `ui.breadcrumb-item`. Story exports must include `Contract`, `Disabled`, `Boundaries`, `LongRange`, and `RightToLeft`; the Pagination `play` function clicks page 2 and asserts the controlled story updates `aria-current` without a document navigation.

- [ ] **Step 7: Add semantic styles and exports**

Use logical properties and existing `--popcandy-space-*`, `--popcandy-ink*`, `--popcandy-border*`, `--popcandy-surface*`, `--popcandy-radius-*`, and `--popcandy-focus` tokens. Add `navigation` to the Vite entry list and `./navigation` to package exports; export both components and all named prop types from `navigation.ts` and `index.ts`.

- [ ] **Step 8: Run component gates**

```bash
pnpm --filter @unpopping-candy/ui test
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/docs test
npm run verify
```

Expected: all commands exit 0; Storybook browser checks report no axe violation.

- [ ] **Step 9: Commit navigation primitives**

```bash
git add packages/ui/src/breadcrumbs packages/ui/src/pagination packages/ui/src/navigation.ts packages/ui/src/index.ts packages/ui/src/styles.css packages/ui/package.json packages/ui/vite.config.ts packages/ui/test/pagination-model.test.ts apps/docs/stories/catalog/ui/Breadcrumbs.stories.tsx apps/docs/stories/catalog/ui/Pagination.stories.tsx
git commit -m "feat(ui): add breadcrumbs and pagination"
```

## Task 3: Implement native Table and Progress

**Files:**

- Create: `packages/ui/src/table/table.tsx`
- Create: `packages/ui/src/table/table.docs.ts`
- Create: `packages/ui/src/progress/progress.tsx`
- Create: `packages/ui/src/progress/progress.docs.ts`
- Create: `packages/ui/src/data-display.ts`
- Create: `apps/docs/stories/catalog/ui/Table.stories.tsx`
- Create: `apps/docs/stories/catalog/ui/Progress.stories.tsx`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles.css`
- Modify: `packages/ui/package.json`
- Modify: `packages/ui/vite.config.ts`

**Interfaces:**

- Consumes: native `table`, `caption`, and `progress` behavior.
- Produces: `Table`, `Progress`, their prop types, `@unpopping-candy/ui/data-display`, and IDs `ui.table` and `ui.progress`.

- [ ] **Step 1: Add red Storybook contracts**

Table's `Contract` story must use `<thead>`, row and column `<th scope>`, `<tbody>`, and long localized notification text. Progress stories must cover `Determinate`, `Indeterminate`, `Complete`, and `RightToLeft`, with consumer-supplied label and `valueText`.

Run: `pnpm --filter @unpopping-candy/docs test`

Expected: FAIL because `Table` and `Progress` are not exported.

- [ ] **Step 2: Implement Table as native presentation**

```tsx
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { caption, children, className, hideCaption = false, ...props },
  ref,
) {
  return (
    <div className="popcandy-table-scroll" data-popcandy-component="table">
      <table
        {...props}
        ref={ref}
        className={mergeClassNames("popcandy-table", className)}
      >
        <caption
          className={hideCaption ? "popcandy-visually-hidden" : undefined}
        >
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
});
```

Do not add `role="grid"`, roving focus, selection props, sorting callbacks, or interactive cell behavior. The docs require `scope` on headers and advise a separate action link/button when content needs activation.

- [ ] **Step 3: Implement native Progress**

```tsx
export const Progress = forwardRef<HTMLProgressElement, ProgressProps>(
  function Progress(
    { ariaLabel, className, label, max = 100, value, valueText, ...props },
    ref,
  ) {
    if (value !== undefined && (value < 0 || value > max))
      throw new RangeError("value must be between 0 and max.");
    return (
      <label
        className={mergeClassNames("popcandy-progress", className)}
        data-popcandy-component="progress"
        data-popcandy-state={
          value === undefined ? "indeterminate" : "determinate"
        }
      >
        <span className="popcandy-progress__label">{label}</span>
        <progress
          {...props}
          ref={ref}
          aria-label={ariaLabel}
          aria-valuetext={valueText}
          max={max}
          value={value}
        />
        {valueText ? (
          <span className="popcandy-progress__value">{valueText}</span>
        ) : null}
      </label>
    );
  },
);
```

Use a visually stable indeterminate animation, and disable it under `prefers-reduced-motion` without hiding progress semantics.

- [ ] **Step 4: Add docs, styles, and public exports**

Table metadata explicitly says non-interactive native presentation and links to `ui.data-grid`; Progress metadata requires locale-aware `valueText` when a number alone is ambiguous. Add `data-display` to Vite/package exports and export both components/types from `data-display.ts` and `index.ts`.

- [ ] **Step 5: Verify browser semantics**

```bash
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/docs test
npm run verify
```

Expected: table role/caption/header assertions and progress name/value/state assertions pass with zero axe errors.

- [ ] **Step 6: Commit native data presentation**

```bash
git add packages/ui/src/table packages/ui/src/progress packages/ui/src/data-display.ts packages/ui/src/index.ts packages/ui/src/styles.css packages/ui/package.json packages/ui/vite.config.ts apps/docs/stories/catalog/ui/Table.stories.tsx apps/docs/stories/catalog/ui/Progress.stories.tsx
git commit -m "feat(ui): add semantic table and progress"
```

## Task 4: Implement controlled interactive DataGrid

**Files:**

- Create: `packages/ui/src/data-grid/data-grid.tsx`
- Create: `packages/ui/src/data-grid/data-grid-selection.ts`
- Create: `packages/ui/src/data-grid/data-grid.docs.ts`
- Create: `apps/docs/stories/catalog/ui/DataGrid.stories.tsx`
- Modify: `packages/ui/src/data-display.ts`
- Modify: `packages/ui/src/index.ts`
- Modify: `packages/ui/src/styles.css`
- Test: `packages/ui/test/data-grid-selection.test.ts`

**Interfaces:**

- Consumes: `normalizeDataGridSelection(selection: 'all' | ReadonlySet<DataGridKey>, rowKeys: readonly DataGridKey[]): ReadonlySet<DataGridKey>`.
- Produces: generic `DataGrid`, `DataGridColumn`, `DataGridKey`, `DataGridProps`, and ID `ui.data-grid`; selection is always consumer-controlled.

- [ ] **Step 1: Write and observe the selection normalization test**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { normalizeDataGridSelection } from "../src/data-grid/data-grid-selection.ts";

test("DataGrid expands internal all without leaking React Aria Selection", () => {
  assert.deepEqual(
    [...normalizeDataGridSelection("all", ["a", "b"])],
    ["a", "b"],
  );
  assert.deepEqual(
    [...normalizeDataGridSelection(new Set(["b"]), ["a", "b"])],
    ["b"],
  );
});
```

Run: `node --experimental-strip-types --test packages/ui/test/data-grid-selection.test.ts`

Expected: FAIL because `data-grid-selection.ts` does not exist.

- [ ] **Step 2: Implement selection normalization**

```ts
export function normalizeDataGridSelection(
  selection: "all" | ReadonlySet<DataGridKey>,
  rowKeys: readonly DataGridKey[],
): ReadonlySet<DataGridKey> {
  return selection === "all" ? new Set(rowKeys) : new Set(selection);
}
```

Run: `node --experimental-strip-types --test packages/ui/test/data-grid-selection.test.ts`

Expected: PASS.

- [ ] **Step 3: Implement the React Aria adapter**

Use aliased imports from `react-aria-components` for `Table`, `TableHeader`, `TableBody`, `Column`, `Row`, and `Cell`. Map public columns/rows to those internals, set `selectionBehavior="toggle"`, pass controlled `selectedKeys`, normalize `onSelectionChange`, and require one `isRowHeader` column. Public declarations must not mention `Selection`, `Key`, `TableProps`, or other React Aria names.

```tsx
const handleSelectionChange = (next: Selection) => {
  if (selectionMode === "none") return;
  onSelectionChange(normalizeDataGridSelection(next, rows.map(getRowKey)));
};

<AriaTable
  aria-label={ariaLabel}
  selectionMode={selectionMode}
  selectionBehavior="toggle"
  selectedKeys={selectedKeys}
  onSelectionChange={handleSelectionChange}
>
  <AriaTableHeader columns={columns}>
    {(column) => (
      <AriaColumn id={column.id} isRowHeader={column.isRowHeader}>
        {column.header}
      </AriaColumn>
    )}
  </AriaTableHeader>
  <AriaTableBody items={rows} renderEmptyState={() => emptyContent}>
    {(row) => (
      <AriaRow id={getRowKey(row)} columns={columns}>
        {(column) => <AriaCell>{column.render(row)}</AriaCell>}
      </AriaRow>
    )}
  </AriaTableBody>
</AriaTable>;
```

Export the generic forward-ref component with a typed assertion that preserves `<TRow>` without `any`, `@ts-ignore`, or `@ts-expect-error`:

```ts
export const DataGrid = forwardRef(DataGridInner) as <TRow>(
  props: DataGridProps<TRow> & RefAttributes<HTMLDivElement>,
) => ReactElement;
```

- [ ] **Step 4: Encode focus, keyboard, RTL, and selection stories**

`Contract` and `MultipleSelection` play functions must prove one Tab enters the grid, arrow keys move within the grid without adding document tab stops, Space toggles a row, Shift+Arrow extends multi-selection where supported, disabled rows cannot select, and focus remains after controlled rerender. Add `Empty`, `LongContent`, and `RightToLeft`; assert selected state is announced beyond color and `dir="rtl"` does not reverse logical column meaning.

- [ ] **Step 5: Document the distinct contract**

Metadata must say: use `Table` for reading and `DataGrid` for grid focus/selection; selection is controlled; row keys are stable; the app owns filtering, sorting, routing, paging, fetching, and mutations; a DataGrid cannot change to Table mode after mount. Document row-header requirement, disabled rows, focus restoration, Home/End and arrow behavior supplied by React Aria, and screen-reader expectations.

- [ ] **Step 6: Add token-only styles**

Style focus, hover, selected, disabled, and empty states using existing semantic tokens and stable attributes. The grid scroll container uses logical properties; selected state combines border/weight/icon or text treatment with color. Do not add cell editing or sticky/virtualized layout.

- [ ] **Step 7: Run focused and browser gates**

```bash
pnpm --filter @unpopping-candy/ui test
pnpm --filter @unpopping-candy/ui typecheck
pnpm --filter @unpopping-candy/docs test
pnpm --filter @unpopping-candy/ui build
```

Expected: all commands exit 0; generated declarations expose no `react-aria-components` types in the public API.

- [ ] **Step 8: Commit DataGrid**

```bash
git add packages/ui/src/data-grid packages/ui/src/data-display.ts packages/ui/src/index.ts packages/ui/src/styles.css packages/ui/test/data-grid-selection.test.ts apps/docs/stories/catalog/ui/DataGrid.stories.tsx
git commit -m "feat(ui): add controlled data grid"
```

## Task 5: Build the app-owned notification/activity workflow

**Files:**

- Create: `apps/docs/stories/workflows/ActivityReview.stories.tsx`
- Create: `tests/browser/activity-review.spec.ts`
- Consume: `playwright.config.ts`

**Interfaces:**

- Consumes: `NotificationItem`, `Breadcrumbs`, `Pagination`, `Table`, `DataGrid`, `Progress`, `Alert`, `Button`, `EmptyState`, `Skeleton`; application callbacks and local fixture state.
- Produces: one Storybook `ActivityReviewFixture` with `status: 'loading' | 'empty' | 'error' | 'ready'`, controlled `page`, `filter`, `selectedKeys`, and `pendingIds`; Task 7 reproduces this public consumer contract inside the canonical clean fixture.

- [ ] **Step 1: Write the workflow browser test first**

```ts
test("activity review keeps navigation, filters, paging and selection in the app", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=workflows-activity-review--ready");
  await expect(
    page.getByRole("navigation", { name: "Activity location" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Page 2" }).click();
  await expect(page.getByRole("button", { name: "Page 2" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page
    .getByRole("grid", { name: "Notification activity" })
    .press("Space");
  await expect(page.getByText("1 selected")).toBeVisible();
});
```

Run: `pnpm test:browser -- tests/browser/activity-review.spec.ts --project=chromium`

Expected: FAIL because the workflow story is absent.

- [ ] **Step 2: Implement an app-owned fixture state machine**

The fixture accepts data and callbacks; its story harness simulates fetch completion, retry, filter choice, URL/page changes, controlled selection, and pending “mark read” state. No source under `packages/ui` or `packages/social` imports `fetch`, a router, TanStack Query, SWR, Zustand, API DTOs, or auth state.

```ts
type ActivityReviewState = {
  status: "loading" | "empty" | "error" | "ready";
  page: number;
  filter: "all" | "unread";
  selectedKeys: ReadonlySet<string>;
  pendingIds: ReadonlySet<string>;
};
```

- [ ] **Step 3: Add every visible workflow state**

Export `Ready`, `Loading`, `Empty`, `Error`, `Pending`, `ResponsiveNarrow`, `LongContent`, `TablePresentation`, and `DataGridSelection`. Copy is consumer-owned and locale-ready. `Loading` uses Progress/Skeleton with an accessible name; `Error` preserves retry ownership; `Pending` disables only the affected action; narrow layout retains reading and focus order.

- [ ] **Step 4: Prove separation and keyboard behavior**

Extend the browser test to assert breadcrumb link/current semantics, Table caption/header cells with no grid role, DataGrid arrow/Space selection, pagination boundaries, retry callback, pending `aria-busy`, focus after rerender, an axe pass, and the same interaction under `dir="rtl"`.

- [ ] **Step 5: Run the real surface**

```bash
pnpm test:browser -- tests/browser/activity-review.spec.ts --project=chromium
pnpm test:browser -- tests/browser/activity-review.spec.ts --project=firefox
pnpm test:browser -- tests/browser/activity-review.spec.ts --project=webkit
```

Expected: Stage 0's `@playwright/test@1.62.1` configuration starts Storybook through its `webServer`; all three browser projects pass. Manually inspect `Ready`, `ResponsiveNarrow`, and `LongContent` at desktop and 390px width with no clipping or lost focus indicator.

- [ ] **Step 6: Commit the flagship workflow**

```bash
git add apps/docs/stories/workflows/ActivityReview.stories.tsx tests/browser/activity-review.spec.ts
git commit -m "feat(docs): prove the activity review workflow"
```

## Task 6: Regenerate knowledge, verify the immutable budget, and add the Changeset

**Files:**

- Consume without modification: `config/bundle-budgets.json`
- Create: `.changeset/stage-three-navigation-data.md`
- Regenerate: files listed under “Generated outputs” in the file map

**Interfaces:**

- Consumes: six component metadata sources, five Storybook contracts, Stage 0 bundle checker.
- Produces: exact catalog/search/get/compose guidance, generated Figma templates that remain internal, and a coordinated nine-package `0.3.0` release note.

- [ ] **Step 1: Run generation before editing generated output**

```bash
npm run agent:generate
npm run agent:check
```

Expected: generation adds `ui.breadcrumbs`, `ui.breadcrumb-item`, `ui.pagination`, `ui.table`, `ui.data-grid`, and `ui.progress`; refreshes knowledge, agent, Registry, Figma Code Connect, eval baseline, and skill outputs named in the file map; and exits 0 without a fixed component-count assertion.

- [ ] **Step 2: Verify discovery by stable ID**

```bash
npm run popcandy -- search "notification activity navigation pagination structured data" --json
npm run popcandy -- get ui.pagination --json
npm run popcandy -- get ui.table --json
npm run popcandy -- get ui.data-grid --json
npm run popcandy -- compose "notification activity review with app-owned filtering paging and controlled selection" --json
```

Expected: imports and props exactly match the public declarations; compose distinguishes Table from DataGrid and assigns routing/fetch/filter/page/selection ownership to the application.

- [ ] **Step 3: Verify the immutable Stage 0 allocation**

Run the Stage 0 checker against production consumer bundles. Stage 3 consumes the already-reviewed allocation in `config/bundle-budgets.json`; this task must not rewrite ceilings or baselines.

Run: `pnpm bundle:check -- --stage stage-3 --json .artifacts/bundles/stage-3.json`

Expected: PASS with a machine-readable Stage 3 report and no change to `config/bundle-budgets.json`; a failure blocks release and requires reducing the implementation or a separately approved Stage 0 allocation change.

- [ ] **Step 4: Add the coordinated Changeset**

```md
---
"@unpopping-candy/tokens": minor
"@unpopping-candy/theme": minor
"@unpopping-candy/icons": minor
"@unpopping-candy/ui": minor
"@unpopping-candy/social": minor
"@unpopping-candy/knowledge": minor
"@unpopping-candy/registry": minor
"@unpopping-candy/cli": minor
"@unpopping-candy/mcp": minor
---

Add navigation and structured-activity contracts, including native Table semantics and controlled DataGrid selection, for the coordinated 0.3.0 release.
```

- [ ] **Step 5: Commit canonical and generated contracts**

```bash
git add packages/knowledge/src/generated packages/registry/src/registry.json agent DESIGN.md docs/agent-evals/baseline.md figma/manifest.json figma/code-connect skills .changeset/stage-three-navigation-data.md
git commit -m "docs: publish stage three agent contracts"
```

## Task 7: Pass the canonical compatibility matrix from packed artifacts

**Files:**

- Modify: `fixtures/compatibility/scenarios/activity-review.tsx`
- Consume without modification: `fixtures/compatibility/matrix.json`
- Consume without modification: `scripts/run-compatibility-matrix.mjs`

**Interfaces:**

- Consumes: the Stage 0 canonical compatibility runner, its seven framework cells, its package-manager descriptors, and `ActivityReviewFixture` using only public exports.
- Produces: immutable evidence for the activity-review scenario installed from packed artifacts in fresh temporary directories with no workspace alias.

- [ ] **Step 1: Prove the Stage 0 fallback lacks the Stage 3 contract**

Run: `pnpm fixtures:compat -- --fixture activity-review --cell vite-react-19 --manager pnpm-11`

Expected before the Stage 3 scenario update: FAIL because the fallback does not assert the new Breadcrumbs, Pagination, Table, DataGrid, Progress, controlled-selection, and app-owned state contract.

- [ ] **Step 2: Register the named scenario**

Extend the existing `fixtures/compatibility/scenarios/activity-review.tsx` fallback under fixture ID `activity-review`. The canonical runner already discovers that file; do not add another cell manifest or runner. Reproduce the Storybook workflow through public imports and accept routing, fetch, filter, page, selection, and pending callbacks rather than importing a framework.

- [ ] **Step 3: Pass the focused packed-artifact cell**

Run: `pnpm fixtures:compat -- --fixture activity-review --cell vite-react-19 --manager pnpm-11`

Expected: PASS after a clean temporary install of all public package tarballs. The result records exact dependency and package-manager versions, tarball SHA-256 digests, TypeScript 5.7 declaration checking, production build status, and workflow smoke-test status.

- [ ] **Step 4: Pass all canonical cells**

Run: `pnpm fixtures:compat -- --fixture activity-review --all`

Expected: every one of the seven Stage 0 framework cells passes from packed artifacts. Vite uses controlled local history, Next adapters use `useRouter().push`, and React Router adapters use `useNavigate`; no framework import appears in `@unpopping-candy/ui` or `@unpopping-candy/social`.

- [ ] **Step 5: Commit only the canonical scenario**

```bash
git add fixtures/compatibility/scenarios/activity-review.tsx
git commit -m "test: add activity compatibility scenario"
```

Expected: no cell manifest or runner is staged.

## Task 8: Capture browser, AT, model, and onboarding launch evidence

**Files:**

- Create: `packages/evals/src/real/activity-review-task.ts`
- Create: `packages/evals/test/activity-review-task.test.ts`
- Modify: `packages/evals/src/reference-scenarios.ts`
- Create after authorized runs: `docs/evidence/0.3.0/stage-3-browser-at.json`
- Create after authorized runs: `docs/evidence/0.3.0/stage-3-onboarding.json`
- Create after authorized runs: `docs/evidence/0.3.0/stage-3-model-evals.json`

**Interfaces:**

- Consumes: Stage 0 sanitized-capture runner, browser/AT evidence schema, approved public fixture content, and five independent evaluators.
- Produces: fresh auditable evidence for the stable thresholds; no raw provider output or personal data enters git.

- [ ] **Step 1: Define and test the activity model task**

```ts
export const activityReviewTask: ModelEvaluationTask = {
  id: "activity-review-stage-3",
  repetitions: 5,
  prompt:
    "Build a notification activity review with loading, empty, error, pending, breadcrumbs, pagination, native Table, and controlled DataGrid selection. Keep fetching, routing, filtering, paging, and selection in the application.",
  requiredCatalogIds: [
    "social.notification-item",
    "ui.breadcrumbs",
    "ui.pagination",
    "ui.table",
    "ui.data-grid",
    "ui.progress",
  ],
  forbiddenOwnership: [
    "fetching",
    "routing",
    "filtering",
    "pagination",
    "selection",
  ],
};
```

The unit test asserts five repetitions, only approved public catalog IDs, the exact required states, and all five forbidden ownership categories.

Run: `node --experimental-strip-types --test packages/evals/test/activity-review-task.test.ts`

Expected: PASS.

- [ ] **Step 2: Run deterministic evaluation**

```bash
npm run evals:generate
npm run evals:check
```

Expected: invented imports/props/tokens/IDs and package-owned app state fail deterministically; the supported fixture passes.

- [ ] **Step 3: Obtain explicit authorization, then run real models**

Run only after model credentials, budget, retention, and public-fixture approval are recorded:

```bash
pnpm evals:run -- --task activity-review-stage-3 --provider codex --repetitions 5
pnpm evals:run -- --task activity-review-stage-3 --provider claude --repetitions 5
pnpm evals:report -- --task activity-review-stage-3 --max-age-days 30
```

Expected: sanitized evidence records provider/model, timestamp, evaluator version, repetition, outcome/reason, token usage, cost estimate, comparison baseline, and confidence interval. Raw captures remain under ignored `.artifacts/model-evals/`; committed summaries contain no secret, personal data, absolute user path, or private repository content.

- [ ] **Step 4: Capture browser and AT evidence on real surfaces**

Record OS, exact browser, AT, component, scenario, result, tester, and date for the latest two stable major releases of Chrome, Edge, Firefox, desktop Safari, and iOS Safari. Include Safari with VoiceOver on macOS, Chrome with NVDA on Windows, and physical iOS Safari or an approved real-device service. Exercise breadcrumb reading order, pagination labels/focus, Table headers, DataGrid grid navigation/selection, Progress announcements, RTL, narrow layout, and focus after pending rerender.

Expected: no keyboard trap, inaccessible name, focus loss, incorrect role/state, or blocking screen-reader defect. Missing device access leaves the stable gate closed; do not enter fabricated PASS records.

- [ ] **Step 5: Run the five-person onboarding gate**

Each evaluator starts from packed artifacts and completes the README quickstart plus the activity workflow without maintainer help. Record anonymous evaluator ID, start/end timestamps, success, intervention count, and blocker. At least four of five must succeed in 20 minutes or less.

- [ ] **Step 6: Commit reproducible task definitions and authorized summaries**

```bash
git add packages/evals/src/real/activity-review-task.ts packages/evals/src/reference-scenarios.ts packages/evals/test/activity-review-task.test.ts docs/evidence/0.3.0/stage-3-browser-at.json docs/evidence/0.3.0/stage-3-onboarding.json docs/evidence/0.3.0/stage-3-model-evals.json
git commit -m "test: record stage three launch evidence"
```

The task schema, deterministic evaluation, redaction checks, and missing-evidence behavior are executable automated gates. Real provider calls, AT/device sessions, and independent onboarding are approval-dependent evidence gates. If external evidence is not authorized, commit only the task definition/test and leave the three evidence files absent; `verify-stable-0-3` must fail with explicit missing-evidence codes.

## Task 9: Build offline release packing and rehearsal commands

**Files:**

- Create: `scripts/pack-release.mjs`
- Create: `tests/architecture/pack-release.test.mjs`
- Create: `scripts/rehearse-release.mjs`
- Create: `tests/architecture/rehearse-release.test.mjs`
- Modify: `package.json`

**Interfaces:**

- Produces: `packRelease(options: { repositoryRoot: string; version: '0.3.0'; channel: 'latest'; outputDirectory: string }): Promise<{ version: '0.3.0'; channel: 'latest'; artifacts: readonly PackedArtifact[] }>` where each artifact has `packageName`, `version`, `tarballPath`, and `sha256`.
- Produces: `verifyReleasePack(options: { manifestPath: string; expectedVersion: '0.3.0'; expectedChannel: 'latest' }): Promise<void>`; it fails on any prerelease, version/channel mismatch, private package, package-count mismatch, missing digest/evidence file, or changed tarball bytes.
- Produces: `rehearseRelease(options: { artifactsDirectory: string; offline: true }): Promise<ReleaseRehearsalReport>`; the directory must contain exactly one of `candidate.json` or `release-pack.json` and returns rollback version, deprecation copy, migration URL, normalized provenance, verified artifact digests, and restoration steps.
- Produces: `normalizeRehearsalManifest(source: 'candidate' | 'release-pack', manifest: unknown): NormalizedReleaseArtifactSet` with exact `source`, `version`, `channel`, nine public `artifacts`, and `provenance`. Candidate input accepts only `0.3.0-alpha.N` or `0.3.0-beta.N` under `next`; release-pack input accepts only stable `0.3.0` under `latest`.
- Produces root aliases `release:pack` and `release:rehearse`; both operate locally and perform no registry mutation.

- [ ] **Step 1: Write the packing test first**

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLIC_RELEASE_PACKAGES,
  parsePackReleaseArguments,
  validateReleasePackManifest,
} from "../../scripts/pack-release.mjs";

test("stable pack requires exact version, latest channel, and output", () => {
  assert.deepEqual(
    parsePackReleaseArguments([
      "--version",
      "0.3.0",
      "--channel",
      "latest",
      "--output",
      ".artifacts/releases/0.3.0",
    ]),
    {
      version: "0.3.0",
      channel: "latest",
      outputDirectory: ".artifacts/releases/0.3.0",
    },
  );
  assert.throws(
    () =>
      parsePackReleaseArguments([
        "--version",
        "0.3.0",
        "--output",
        ".artifacts/releases/0.3.0",
      ]),
    /--channel latest is required/,
  );
  assert.throws(
    () =>
      parsePackReleaseArguments([
        "--version",
        "0.3.0",
        "--channel",
        "next",
        "--output",
        ".artifacts/releases/0.3.0",
      ]),
    /stable pack requires exact version 0.3.0 and channel latest/,
  );
});

test("pack release contains exactly the nine public packages", () => {
  assert.deepEqual(PUBLIC_RELEASE_PACKAGES, [
    "@unpopping-candy/tokens",
    "@unpopping-candy/theme",
    "@unpopping-candy/icons",
    "@unpopping-candy/ui",
    "@unpopping-candy/social",
    "@unpopping-candy/knowledge",
    "@unpopping-candy/registry",
    "@unpopping-candy/cli",
    "@unpopping-candy/mcp",
  ]);
});

test("stable verification rejects prerelease and next manifests", () => {
  const artifacts = PUBLIC_RELEASE_PACKAGES.map((packageName, index) => ({
    packageName,
    version: "0.3.0",
    tarballPath: `package-${index}.tgz`,
    sha256: "a".repeat(64),
  }));
  assert.doesNotThrow(() =>
    validateReleasePackManifest(
      { version: "0.3.0", channel: "latest", artifacts },
      { expectedVersion: "0.3.0", expectedChannel: "latest" },
    ),
  );
  assert.throws(
    () =>
      validateReleasePackManifest(
        { version: "0.3.0-beta.1", channel: "next", artifacts },
        { expectedVersion: "0.3.0", expectedChannel: "latest" },
      ),
    /stable release requires exact version 0.3.0 and channel latest/,
  );
});
```

Run: `node --test tests/architecture/pack-release.test.mjs`

Expected: FAIL because `scripts/pack-release.mjs` does not exist.

- [ ] **Step 2: Implement deterministic nine-package packing**

`packRelease` is stable-only; beta packaging remains owned by `release:candidate`. Require `--version 0.3.0`, `--channel latest`, and `--output`, rejecting a missing channel, `next`, prereleases, and every other version/channel before filesystem work. Read the Stage 0 public-package whitelist, invoke `pnpm pack` once per public package, hash bytes with SHA-256, inspect ESM exports/types/license, reject private `evals` or `figma`, and write `release-pack.json` with exact top-level `version: "0.3.0"` and `channel: "latest"` plus `release-pack.sha256` inside the explicit output directory. Add verification mode that requires `--verify`, `--version 0.3.0`, and `--channel latest`, re-hashes every tarball, and calls `verifyReleasePack` without packing or publishing. It never invokes `npm publish`, changes a dist-tag, or writes outside the requested directory.

```json
{
  "release:pack": "node scripts/pack-release.mjs"
}
```

- [ ] **Step 3: Pass the packing tests**

Run: `node --test tests/architecture/pack-release.test.mjs`

Expected: PASS for argument parsing, nine-package whitelist, version/channel equality, digest recording and re-verification, output containment, prerelease/`next` rejection, missing evidence, and private-package rejection.

- [ ] **Step 4: Write the offline rehearsal test first**

```js
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PUBLIC_RELEASE_PACKAGES } from "../../scripts/pack-release.mjs";
import {
  buildReleaseRehearsalReport,
  normalizeRehearsalManifest,
  selectRehearsalManifest,
  verifyRehearsalArtifactDigests,
} from "../../scripts/rehearse-release.mjs";

const artifacts = PUBLIC_RELEASE_PACKAGES.map((packageName, index) => {
  const tarballPath = `package-${index}.tgz`;
  return {
    packageName,
    version: "0.3.0",
    tarballPath,
    sha256: createHash("sha256").update(tarballPath).digest("hex"),
  };
});

test("rehearsal normalizes candidate next and stable latest manifests", () => {
  const candidate = normalizeRehearsalManifest("candidate", {
    version: "0.3.0-beta.1",
    channel: "next",
    packages: artifacts.map((artifact) => ({
      ...artifact,
      version: "0.3.0-beta.1",
    })),
    sourceCommit: "56588bd20250ff63e73d157cd5e7530e1eb6db8f",
    catalogDigest: "b".repeat(64),
  });
  const stable = normalizeRehearsalManifest("release-pack", {
    version: "0.3.0",
    channel: "latest",
    artifacts,
    provenance: { sourceCommit: "56588bd20250ff63e73d157cd5e7530e1eb6db8f" },
  });
  assert.equal(candidate.channel, "next");
  assert.equal(candidate.artifacts.length, 9);
  assert.equal(stable.channel, "latest");
  assert.equal(stable.artifacts.length, 9);
});

test("rehearsal rejects zero or ambiguous manifests", () => {
  assert.throws(
    () => selectRehearsalManifest([]),
    /exactly one release manifest/,
  );
  assert.throws(
    () => selectRehearsalManifest(["candidate.json", "release-pack.json"]),
    /exactly one release manifest/,
  );
});

test("rehearsal detects changed tarball bytes", async () => {
  const normalized = normalizeRehearsalManifest("release-pack", {
    version: "0.3.0",
    channel: "latest",
    artifacts,
    provenance: { sourceCommit: "56588bd20250ff63e73d157cd5e7530e1eb6db8f" },
  });
  await verifyRehearsalArtifactDigests(normalized, async (path) =>
    Buffer.from(path),
  );
  await assert.rejects(
    verifyRehearsalArtifactDigests(normalized, async () =>
      Buffer.from("changed"),
    ),
    /digest mismatch/,
  );
});

test("offline rehearsal records rollback and never schedules a registry write", () => {
  const report = buildReleaseRehearsalReport({
    version: "0.3.0",
    rollbackVersion: "0.2.0",
    migrationUrl:
      "https://github.com/julymeltdown/unpopping-candy-design/blob/master/docs/MIGRATION.md",
  });
  assert.equal(report.networkWrites, 0);
  assert.equal(report.rollbackVersion, "0.2.0");
  assert.match(report.deprecationMessage, /0.3.0/);
  assert.ok(report.restorationSteps.length > 0);
});

test("rehearsal source contains no network mutation primitive", async () => {
  const source = await readFile("scripts/rehearse-release.mjs", "utf8");
  assert.doesNotMatch(
    source,
    /\bfetch\b|https\.request|npm publish|npm deprecate/,
  );
});
```

Run: `node --test tests/architecture/rehearse-release.test.mjs`

Expected: FAIL because `scripts/rehearse-release.mjs` does not exist.

- [ ] **Step 5: Implement offline rehearsal**

The CLI requires `--artifacts` and `--offline`. Select exactly one manifest in that directory: zero or both `candidate.json` and `release-pack.json` is an error. Normalize candidate `packages` and release-pack `artifacts` to one nine-public-package shape with exact version, channel, relative tarball path, SHA-256, source commit, catalog/provenance data, and source kind. Accept only alpha/beta candidate versions on `next` and exact stable `0.3.0` on `latest`; reject private/duplicate/missing packages, invalid provenance, traversal, and every digest mismatch before writing `release-rehearsal.json`. Reject execution without `--offline`; report commands an authorized maintainer would later use, but contain no network client or mutation execution.

```json
{
  "release:rehearse": "node scripts/rehearse-release.mjs"
}
```

- [ ] **Step 6: Pass release-harness gates and commit**

```bash
node --test tests/architecture/pack-release.test.mjs
node --test tests/architecture/rehearse-release.test.mjs
pnpm test:pure
git diff --check
git add scripts/pack-release.mjs tests/architecture/pack-release.test.mjs scripts/rehearse-release.mjs tests/architecture/rehearse-release.test.mjs package.json
git commit -m "build: add offline release rehearsal tools"
```

Expected: every command exits 0 before either root alias is used by a later task; rehearsal tests pass for candidate and stable shapes, digest success/failure, zero/both-manifest ambiguity, and absence of network mutation primitives.

## Task 10: Prepare the staging-only `0.3.0-beta.1` candidate

**Files:**

- Consume without modification: Stage 0 `release:candidate` implementation and its `next` channel policy
- Write only ignored evidence: `.artifacts/releases/stage-3-beta.1`

**Interfaces:**

- Consumes: completed Stage 3 components, workflow, generated artifacts, normal Changesets, canonical compatibility and bundle gates.
- Produces: a local staging candidate for version `0.3.0-beta.1` and intended channel `next`; source manifests and npm remain unchanged.

- [ ] **Step 1: Re-run executable Stage 0 inheritance gates**

```bash
pnpm agent:check
pnpm test:pure
pnpm verify
pnpm typecheck
pnpm build
pnpm test:storybook
pnpm test:browser -- tests/browser/activity-review.spec.ts
pnpm bundle:check -- --stage stage-3 --json .artifacts/bundles/stage-3.json
pnpm fixtures:compat -- --fixture activity-review --all
git diff --check
```

Expected: every automated command exits 0. These are executable gates inherited from Stage 0; they do not substitute for approval-dependent real-model, AT/device, onboarding, namespace, Pages, Chromatic, or publishing evidence.

- [ ] **Step 2: Prepare the beta candidate through the canonical channel**

Run: `pnpm release:candidate -- --version 0.3.0-beta.1 --channel next --out .artifacts/releases/stage-3-beta.1`

Expected: the Stage 0 tool stages exact beta tarballs and metadata locally, records intended channel `next`, performs no network write, and leaves source package manifests unchanged. There is no `0.3.0-rc.N` lane.

- [ ] **Step 3: Inspect staging evidence**

Run: `pnpm release:rehearse -- --artifacts .artifacts/releases/stage-3-beta.1 --offline`

Expected: rehearsal selects the directory's sole `candidate.json`, normalizes its `0.3.0-beta.1`/`next` package list, verifies all nine digests and provenance inputs, and writes the deprecation/rollback report without publishing or requiring `release-pack.json`.

## Task 11: Produce the stable `0.3.0` dry-run candidate

**Files:**

- Create: `scripts/verify-stable-0-3.mjs`
- Create: `tests/architecture/stable-release.test.mjs`
- Create: `docs/evidence/0.3.0/stage-3-release.md`
- Modify: `.github/workflows/release.yml`
- Modify: `docs/PUBLISHING.md`
- Modify: `package.json`
- Modify after stable versioning: nine public `packages/*/package.json` manifests, `pnpm-lock.yaml`, generated compatibility/catalog/agent artifacts, and consumed `.changeset` files
- Create after stable versioning: `packages/tokens/CHANGELOG.md`, `packages/theme/CHANGELOG.md`, `packages/icons/CHANGELOG.md`, `packages/ui/CHANGELOG.md`, `packages/social/CHANGELOG.md`, `packages/knowledge/CHANGELOG.md`, `packages/registry/CHANGELOG.md`, `packages/cli/CHANGELOG.md`, `packages/mcp/CHANGELOG.md`

**Interfaces:**

- Consumes: all three flagship workflows, seven framework results, model/AT/onboarding evidence, nine-package Changeset, provenance and rollback rehearsal, defect inventory.
- Produces: `pnpm release:0.3:dry-run`; it validates but cannot publish or change tags. `--evidence-only` checks approval-dependent gates before source versioning; the final invocation additionally requires nine source versions at `0.3.0`.
- Produces: a manual stable workflow whose `publish` input defaults to `false`; verification and evidence upload always run, while the `npm-release` Environment protects the only job allowed to publish exact verified stable tarballs under `latest`.

- [ ] **Step 1: Write and observe the red stable-verifier test**

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  evaluateDefectGate,
  evaluateStableThresholds,
} from "../../scripts/verify-stable-0-3.mjs";

test("stable evidence blocks P0/P1 and permits owned P2 follow-up", () => {
  assert.deepEqual(evaluateDefectGate([{ severity: "P1" }]).codes, [
    "POPCANDY_RELEASE_EVIDENCE_BLOCKING_DEFECT",
  ]);
  assert.deepEqual(
    evaluateDefectGate([
      {
        severity: "P2",
        owner: "maintainers",
        targetDate: "2026-09-01",
        workaround: "Use native Table presentation.",
      },
    ]).codes,
    [],
  );
});

test("stable numeric thresholds fail closed", () => {
  const valid = {
    workflowCount: 3,
    frameworkCellCount: 7,
    onboarding: { succeeded: 4, total: 5, maximumMinutes: 20 },
    model: {
      repetitionsPerTaskModel: 5,
      maximumAgeDays: 30,
      compliance: 0.9,
      improvementPercentagePoints: 20,
    },
  };
  assert.deepEqual(evaluateStableThresholds(valid).codes, []);
  assert.ok(
    evaluateStableThresholds({
      ...valid,
      frameworkCellCount: 6,
    }).codes.includes("POPCANDY_RELEASE_EVIDENCE_FRAMEWORK_CELLS"),
  );
});
```

Run: `node --test tests/architecture/stable-release.test.mjs`

Expected: FAIL because `scripts/verify-stable-0-3.mjs` does not exist.

- [ ] **Step 2: Implement the stable verifier before invoking it**

Add `release:0.3:dry-run` with value `node scripts/verify-stable-0-3.mjs --dry-run`. The verifier emits stable `POPCANDY_RELEASE_EVIDENCE_*` codes for missing evidence, captures older than 30 days, fewer than seven framework cells, fewer than three workflow results, fewer than four successful onboardings, completion over 20 minutes, fewer than five repetitions per task/model, compliance below 90%, improvement below 20 percentage points, version mismatch, missing provenance, or open P0/P1. P2 is non-blocking only with an owner, target date, workaround, and release-report disclosure.

Run: `node --test tests/architecture/stable-release.test.mjs`

Expected: PASS for every threshold and for the guarantee that neither verifier mode invokes `npm publish`, `changeset publish`, or a dist-tag mutation.

- [ ] **Step 3: Close approval-dependent evidence before stable source versioning**

```bash
pnpm evals:report -- --task activity-review-stage-3 --max-age-days 30
pnpm release:0.3:dry-run -- --evidence-only
```

Expected: PASS only when three flagship workflow results, all seven canonical framework cells, fresh five-run/model evidence, browser/AT/device evidence, four-of-five onboarding success within 20 minutes, provenance/authorization records, and the P0/P1 defect inventory are present. If credentials, devices, evaluators, or owner approvals are unavailable, stop with the named missing-evidence codes and do not version stable source.

- [ ] **Step 4: Consume normal Changesets into stable source**

Only after Step 3 passes, run:

```bash
pnpm version-packages
pnpm install --lockfile-only
pnpm agent:generate
```

Expected: accumulated normal Changesets are consumed; the fixed public group coordinates all nine public package manifests and nine `CHANGELOG.md` files to stable `0.3.0`; private `evals` and `figma` remain unversioned. The second `agent:generate` refreshes `packages/knowledge/src/generated`, `packages/registry/src/registry.json`, `agent`, `DESIGN.md`, `docs/agent-evals/baseline.md`, `figma/manifest.json`, `figma/code-connect`, and `skills`, and compatibility maps stable `0.3.0` to exactly one catalog. No `rc` version or npm tag is created.

- [ ] **Step 5: Run the inherited Stage 0 gate plus Stage 3 surface gates**

```bash
pnpm agent:check
pnpm test:pure
pnpm verify
pnpm typecheck
pnpm build
pnpm test:storybook
pnpm test:browser -- --project=chromium --project=firefox --project=webkit
pnpm bundle:check -- --stage stage-3 --json .artifacts/bundles/stage-3.json
pnpm fixtures:compat -- --fixture activity-review --all
pnpm fixtures:compat -- --all
pnpm evals:plan -- --task activity-review-stage-3
node scripts/verify-release-authorizations.mjs --plan
git diff --check
```

Expected: every executable command exits 0. The Stage 0 full gate remains inherited; Stage 3 adds the activity browser scenario, immutable Stage 3 bundle report, and canonical activity compatibility matrix. Planning commands report external enablement but do not call models, devices, paid services, or registries.

- [ ] **Step 6: Create and inspect nine stable tarballs**

Run: `pnpm release:pack -- --version 0.3.0 --channel latest --output .artifacts/releases/0.3.0`

Expected: `release-pack.json` records exact version `0.3.0` and channel `latest`; exactly nine public tarballs contain ESM exports and types, have MIT licenses and SHA-256 digests, install cleanly, and exclude `@unpopping-candy/evals` and `@unpopping-candy/figma`.

- [ ] **Step 7: Rehearse rollback and deprecation without network writes**

Run: `pnpm release:rehearse -- --artifacts .artifacts/releases/0.3.0 --offline`

Expected: rehearsal selects the directory's sole `release-pack.json`, normalizes its exact `0.3.0`/`latest` artifact list, verifies all nine digests/provenance, and reports rollback version, deprecation message, migration link, and restoration procedure without a registry mutation.

- [ ] **Step 8: Verify the complete stable candidate**

Run: `pnpm release:0.3:dry-run`

Expected only after authorized evidence exists: PASS with three workflow results across seven framework cells; at least four of five onboarding successes within 20 minutes; fresh five-run/model results at or above 90% compliance and 20 percentage points over baseline; no open P0/P1; coordinated versions/provenance; rollback rehearsal; exact README/catalog limitation alignment.

- [ ] **Step 9: Write the release evidence report**

`stage-3-release.md` records commit SHA, commands and exit codes, exact package/browser/AT versions, tarball digests, model capture dates, confidence intervals, onboarding aggregate, immutable budget result, visual review link, P2 owner/date/workaround disclosures, warnings, and every external gate. It states “dry-run candidate; not published” and “stable alone is eligible for latest.”

- [ ] **Step 10: Write the failing stable-workflow contract test**

Extend `tests/architecture/stable-release.test.mjs`:

```js
test("stable workflow defaults to dry-run and hardcodes protected latest publication", async () => {
  const workflow = await readFile(".github/workflows/release.yml", "utf8");
  assert.match(workflow, /publish:[\s\S]*type: boolean[\s\S]*default: false/);
  assert.match(workflow, /environment: npm-release/);
  assert.match(
    workflow,
    /npm publish .*--provenance --access public --tag latest/,
  );
  assert.doesNotMatch(workflow, /tag:\s*\$\{\{/);
});
```

Run: `node --test tests/architecture/stable-release.test.mjs`

Expected: FAIL because the Stage 0 workflow has no protected stable `latest` job.

- [ ] **Step 11: Add the manual stable workflow and publication policy**

Modify `.github/workflows/release.yml` with this stable path while preserving the Stage 0 prerelease path:

```yaml
on:
  workflow_dispatch:
    inputs:
      publish:
        description: Publish the already verified stable 0.3.0 tarballs
        type: boolean
        required: true
        default: false

jobs:
  verify-stable-0-3:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11.4.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22.13.0
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: node scripts/verify-release-authorizations.mjs --scope npm,brand
      - run: pnpm agent:check
      - run: pnpm test:pure
      - run: pnpm verify
      - run: pnpm typecheck
      - run: pnpm build
      - run: pnpm test:storybook
      - run: pnpm test:browser -- --project=chromium --project=firefox --project=webkit
      - run: pnpm bundle:check -- --stage stage-3 --json .artifacts/bundles/stage-3.json
      - run: pnpm fixtures:compat -- --fixture activity-review --all
      - run: pnpm fixtures:compat -- --all
      - run: pnpm evals:report -- --task activity-review-stage-3 --max-age-days 30
      - run: pnpm release:0.3:dry-run
      - run: pnpm release:pack -- --version 0.3.0 --channel latest --output .artifacts/releases/0.3.0
      - run: pnpm release:pack -- --verify .artifacts/releases/0.3.0/release-pack.json --version 0.3.0 --channel latest
      - run: pnpm release:rehearse -- --artifacts .artifacts/releases/0.3.0 --offline
      - uses: actions/upload-artifact@v4
        with:
          name: stable-0.3.0-evidence
          path: |
            .artifacts/releases/0.3.0
            .artifacts/bundles/stage-3.json
            docs/evidence/0.3.0
          if-no-files-found: error

  publish-stable-0-3:
    needs: verify-stable-0-3
    if: ${{ inputs.publish }}
    runs-on: ubuntu-latest
    environment: npm-release
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11.4.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22.13.0
          registry-url: https://registry.npmjs.org
      - run: pnpm install --frozen-lockfile
      - uses: actions/download-artifact@v4
        with:
          name: stable-0.3.0-evidence
          path: .
      - run: pnpm release:pack -- --verify .artifacts/releases/0.3.0/release-pack.json --version 0.3.0 --channel latest
      - name: Publish nine verified stable tarballs
        shell: bash
        run: |
          mapfile -t tarballs < <(find .artifacts/releases/0.3.0 -maxdepth 1 -type f -name '*.tgz' -print | sort)
          test "${#tarballs[@]}" -eq 9
          for tarball in "${tarballs[@]}"; do
            npm publish "$tarball" --provenance --access public --tag latest
          done
```

The verification mode fails closed for a prerelease manifest, any version other than exact `0.3.0`, a channel other than `latest` including `next`, a private package, anything other than exactly nine public packages, a missing/mismatched digest, or missing stable evidence. `publish=false` is the default and completes after evidence upload. `publish=true` still cannot publish until the `npm-release` GitHub Environment approval succeeds; the job publishes only the downloaded tarballs re-verified after approval. There is no user-supplied dist-tag input.

Update `docs/PUBLISHING.md` with the same dry-run-default flow, required npm trusted-publisher binding, Environment approvers, exact rejection conditions, evidence artifact, rollback/deprecation rehearsal, and the rule that stable `0.3.0` alone may use `latest`. This plan must not dispatch the workflow.

Run: `node --test tests/architecture/stable-release.test.mjs`

Expected: PASS for default `publish=false`, authorization/full-evidence ordering, exact nine-package/digest verification, evidence upload, protected `npm-release` environment, hardcoded `latest`, and absence of a prerelease/private/`next` publication path.

- [ ] **Step 12: Request final review and commit**

Invoke `superpowers:requesting-code-review` and run the repository browser/visual QA workflow. Resolve every P0/P1 before continuing.

```bash
git add scripts/verify-stable-0-3.mjs tests/architecture/stable-release.test.mjs docs/evidence/0.3.0/stage-3-release.md .github/workflows/release.yml docs/PUBLISHING.md package.json packages/{tokens,theme,icons,ui,social,knowledge,registry,cli,mcp}/package.json packages/{tokens,theme,icons,ui,social,knowledge,registry,cli,mcp}/CHANGELOG.md pnpm-lock.yaml packages/knowledge/src/generated packages/registry/src/registry.json agent DESIGN.md docs/agent-evals/baseline.md figma/manifest.json figma/code-connect skills
git add -u .changeset
git commit -m "chore: prepare the 0.3.0 release candidate"
```

- [ ] **Step 13: Stop before publication**

Do not run `npm publish`, `changeset publish`, create a GitHub release, move `latest`, deploy Storybook, or spend an external service budget. Present the dry-run report and obtain separate authorization for each external action. If publishing is later authorized, only stable `0.3.0` may use `latest`; `0.3.0-beta.1` remains a `next` channel candidate.

## Stage 3 definition of done

- Breadcrumbs/Item, Pagination, native non-interactive Table, controlled interactive DataGrid, and Progress expose documented stable public contracts with ref/native, keyboard, focus, selection, i18n, RTL, and WCAG 2.2 AA evidence.
- The notification/activity workflow visibly covers ready, loading, empty, error, pending, narrow, RTL, long-content, Table, and DataGrid states while the application owns fetch, route, filter, page, and selection state.
- Generated catalog, portable agent documents, Storybook manifest, internal Figma templates, Registry metadata, bundle budgets, and the coordinated nine-package Changeset are current.
- `fixtures/compatibility/scenarios/activity-review.tsx` passes through the Stage 0 canonical runner in all seven exact framework cells from clean packed artifacts; no duplicate matrix or runner exists.
- Stage 0's full automated gate remains green, including Storybook Vitest, `@playwright/test@1.62.1` Chromium/Firefox/WebKit coverage, the canonical compatibility matrix, and the immutable Stage 3 bundle allocation.
- The stable-only `release:pack` requires exact `--version 0.3.0 --channel latest`, records both values in its manifest, and rejects missing/`next`/other channels; beta remains owned by `release:candidate`. Offline `release:rehearse` accepts a directory with exactly one candidate or stable manifest, normalizes alpha/beta-`next` and stable-`latest` shapes, verifies nine coordinated artifacts/digests/provenance, rejects zero/both manifests, and produces rollback evidence with no network write.
- Staging-only `0.3.0-beta.1` is prepared locally under intended channel `next` at `.artifacts/releases/stage-3-beta.1`, with no `rc` lane and no publication. Only after every stable gate passes are normal Changesets consumed into nine-package source version `0.3.0`, compatibility/agent artifacts regenerated, and stable tarballs packed under `.artifacts/releases/0.3.0`.
- The manual stable workflow defaults to `publish=false`, installs frozen dependencies, runs authorization and the complete stable gate, verifies/uploads exactly nine `0.3.0` tarballs and evidence, and permits hardcoded `latest` publication only in the separately approved `npm-release` Environment; `docs/PUBLISHING.md` documents the identical boundary.
- Executable deterministic gates pass independently of external access. Separately authorized real-model evidence meets the five-repetition, 90%, 20-point, cost, confidence-interval, redaction, and 30-day requirements; authorized browser/AT/device evidence passes; at least four of five independent evaluators complete onboarding in 20 minutes.
- The stable dry-run passes with no open P0/P1; every allowed P2 has an owner, target date, workaround, and report disclosure. The report remains explicitly non-publishing until owner authorization, and stable alone is eligible for `latest`.
