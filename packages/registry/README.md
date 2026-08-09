# @commonspace/registry

Versioned Commonspace page and block templates with deterministic SHA-256 manifests and guarded local scaffolding.

- Dry-run is the default.
- `apply` is explicit.
- Existing different files are never overwritten.
- Absolute, traversal, NUL, and symlink escape paths are rejected.
- Template variables are allow-listed by the canonical knowledge catalog.

```ts
import { bundledCatalog } from '@commonspace/knowledge';
import { createRegistryService } from '@commonspace/registry';

const registry = createRegistryService({
  catalog: bundledCatalog,
  templateRoot: new URL('../templates', import.meta.url).pathname,
});

const plan = await registry.scaffold({
  templateId: 'template.social-feed-page',
  projectRoot: process.cwd(),
  mode: 'dry-run',
});
```
