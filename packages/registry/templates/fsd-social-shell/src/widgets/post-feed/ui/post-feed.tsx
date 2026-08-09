import { TimelineView, type SocialPostViewModel } from '@commonspace/social';

export interface PostFeedProps {
  posts: readonly SocialPostViewModel[];
  loading?: boolean;
  error?: string | null;
  onRetry(): void;
}

export function PostFeed(props: PostFeedProps) {
  return <TimelineView {...props} />;
}
