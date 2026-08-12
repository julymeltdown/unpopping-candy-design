import { Stack } from "@unpopping-candy/ui";
import type { SocialPostViewModel } from "@unpopping-candy/social";
import { PostFeed } from "../../../widgets/post-feed/ui/post-feed";

export interface HomePageProps {
  posts: readonly SocialPostViewModel[];
  loading?: boolean | undefined;
  error?: string | null | undefined;
  onRetry(): void;
}

export function HomePage({ posts, loading, error, onRetry }: HomePageProps) {
  return (
    <main aria-labelledby="home-title">
      <Stack gap={0}>
        <header>
          <h1 id="home-title">Home</h1>
        </header>
        <PostFeed
          posts={posts}
          loading={loading}
          error={error}
          onRetry={onRetry}
        />
      </Stack>
    </main>
  );
}
