# @unpopping-candy/theme

Theme and density scoping for Unpopping Candy.

```tsx
import '@unpopping-candy/tokens/styles.css';
import { UnpoppingCandyProvider } from '@unpopping-candy/theme';

<UnpoppingCandyProvider theme="system" density="comfortable" accent="blue">
  <App />
</UnpoppingCandyProvider>;
```

Use `scope="document"` when the whole document belongs to Unpopping Candy. The default local scope renders a token boundary around its children.
