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
