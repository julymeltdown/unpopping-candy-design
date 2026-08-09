# Migration from the Commonspace social application

## Purpose

The source application bundled reusable visual packages with application-specific contracts. This repository separates the two concerns.

## Package mapping

| Application package | Standalone destination | Migration note |
|---|---|---|
| `design-tokens` | `@commonspace/tokens` | expanded into layered tokens and themes |
| `icons` | `@commonspace/icons` | semantic API retained; Ant names hidden |
| `ui` | `@commonspace/ui` | built output and public subpaths added |
| `social-ui` | `@commonspace/social` | backend DTO dependencies removed |

## What does not migrate

```text
JWT and auth providers
TanStack Query and SWR
Zustand stores
React Router
Feature-Sliced Design slices
OpenAPI clients and DTOs
backend services
```

These remain application concerns.

## Social DTO migration

Before:

```tsx
<PostCard post={apiPost} />
```

After:

```tsx
const viewModel = mapPostToSocialViewModel(apiPost);
<PostCard post={viewModel} />
```

Keep the mapper in the consuming application's entity/domain boundary. Do not add API-specific aliases to the design-system model.

## Style migration

Replace application-local CSS imports with package assets:

```tsx
import '@commonspace/tokens/styles.css';
import '@commonspace/icons/styles.css';
import '@commonspace/ui/styles.css';
import '@commonspace/social/styles.css';
```

## Theme migration

Replace document-global assumptions with an explicit provider:

```tsx
<CommonspaceProvider scope="document" theme="system">
  <App />
</CommonspaceProvider>
```

Embedded surfaces should use the default local scope.

## Icon migration

Continue importing semantic names from `@commonspace/icons`. Do not import Ant source icons directly from product code.

## State migration

Components no longer own data mutations or navigation. Connect them in the application:

```tsx
<PostCard
  post={viewModel}
  onLike={() => likeMutation.mutate(post.id)}
  onOpen={() => navigate(postPath(post.id))}
/>
```

## Validation

A migration is complete when:

- no application imports a package's `src` path;
- no social component receives an API DTO directly;
- all package styles load from public exports;
- theme attributes are set by the Provider or bootstrap contract;
- package builds and consumer fixture pass;
- no JWT, Query, Router, SWR, or Zustand dependency enters a design package.

## AI-assisted migration workflow

The portable migration Skill and the CLI use the same versioned catalog as the human documentation. Begin with project detection rather than asking an agent to infer package versions or component names.

```bash
commonspace info --path . --json
commonspace search "profile settings" --kind pattern --json
commonspace compose "migrate the profile route without changing data behavior" --json
```

The recommended migration order is:

```text
1. Detect the project and installed Commonspace versions.
2. Inventory current primitives, tokens, layouts, and state ownership.
3. Replace the application shell and token imports first.
4. Migrate one route or bounded surface at a time.
5. Map API DTOs to Commonspace presentation models at the application boundary.
6. Preserve Query, Router, form, auth, and business behavior in the application.
7. Add loading, empty, error, disabled, pending, and success stories.
8. Run Commonspace validation and Storybook accessibility and interaction checks.
```

Use the migration Skill when the agent client supports Agent Skills:

```text
skills/migrate-to-commonspace/SKILL.md
```

For MCP clients, use the `migrate-interface` prompt and the bounded tools in this order:

```text
commonspace_project_info
→ commonspace_search
→ commonspace_compose
→ commonspace_get
→ implement route slice
→ commonspace_validate
→ Storybook test
```

Do not allow an AI migration to:

- move server state into the design package;
- replace application DTOs with presentation models inside the API layer;
- import package `src` paths;
- invent component props or undocumented variants;
- replace product behavior merely to match a visual example;
- migrate the entire application in one unreviewable change.

A Registry template may be scaffolded only after a dry-run plan has been reviewed:

```bash
commonspace scaffold social-feed --path . --target-directory src/ui --json
commonspace scaffold social-feed --path . --target-directory src/ui --apply --json
```

Existing different files are never overwritten. Template checksums and path boundaries are verified by the Registry service before any write.
