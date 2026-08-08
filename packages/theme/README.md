# @commonspace/theme

Theme and density scoping for Commonspace UI.

```tsx
import '@commonspace/tokens/styles.css';
import { CommonspaceProvider } from '@commonspace/theme';

<CommonspaceProvider theme="system" density="comfortable" accent="blue">
  <App />
</CommonspaceProvider>;
```

Use `scope="document"` when the whole document belongs to Commonspace. The default local scope renders a token boundary around its children.
