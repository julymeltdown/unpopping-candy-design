# @unpopping-candy/icons

Semantic icon names backed by Ant Design Icons.

```tsx
import '@unpopping-candy/icons/styles.css';
import { BookmarkIcon, RepostIcon } from '@unpopping-candy/icons';

<BookmarkIcon size="md" />;
<RepostIcon label="Repost" />;
```

Consumers depend on Unpopping Candy semantic names rather than Ant Design's source component names, which keeps the backing icon library replaceable.
