import { TimelineView, type SocialPostViewModel } from '@unpopping-candy/social';

export interface PostFeedProps {
  posts: readonly SocialPostViewModel[];
  loading?: boolean;
  error?: string | null;
  onRetry(): void;
}

export function PostFeed(props: PostFeedProps) {
  return <TimelineView {...props} />;
}
