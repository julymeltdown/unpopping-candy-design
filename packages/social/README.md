# @unpopping-candy/social

API-agnostic social presentation patterns.

```tsx
import '@unpopping-candy/social/styles.css';
import { PostCard, type SocialPostViewModel } from '@unpopping-candy/social';

const post: SocialPostViewModel = mapApiPost(apiPost);
<PostCard post={post} onLike={() => likePost(post.id)} />;
```

The package owns presentation models only. It does not import backend DTOs, authentication, React Router, TanStack Query, SWR, Zustand, or application slices.
