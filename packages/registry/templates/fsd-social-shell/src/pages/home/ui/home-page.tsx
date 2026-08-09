import { Stack } from '@commonspace/ui';
import type { SocialPostViewModel } from '@commonspace/social';
import { PostFeed } from '../../../widgets/post-feed/ui/post-feed';

export interface HomePageProps {
  posts: readonly SocialPostViewModel[];
  loading?: boolean;
  error?: string | null;
  onRetry(): void;
}

export function HomePage({ posts, loading, error, onRetry }: HomePageProps) {
  return <main aria-labelledby="home-title"><Stack gap={0}><header><h1 id="home-title">Home</h1></header><PostFeed posts={posts} loading={loading} error={error} onRetry={onRetry} /></Stack></main>;
}
