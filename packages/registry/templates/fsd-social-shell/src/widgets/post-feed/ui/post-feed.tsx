import {
  TimelineView,
  type SocialPostViewModel,
} from "@unpopping-candy/social";

export interface PostFeedProps {
  posts: readonly SocialPostViewModel[];
  loading?: boolean | undefined;
  error?: string | null | undefined;
  onRetry(): void;
}

export function PostFeed({ error, loading, onRetry, posts }: PostFeedProps) {
  return (
    <TimelineView
      posts={posts}
      loading={loading}
      error={error}
      onRetry={onRetry}
    />
  );
}
