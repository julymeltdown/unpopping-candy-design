# @commonspace/icons

Semantic icon names backed by Ant Design Icons.

```tsx
import '@commonspace/icons/styles.css';
import { BookmarkIcon, RepostIcon } from '@commonspace/icons';

<BookmarkIcon size="md" />;
<RepostIcon label="Repost" />;
```

Consumers depend on Commonspace semantic names rather than Ant Design's source component names, which keeps the backing icon library replaceable.
