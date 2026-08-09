import { Alert, Button, Stack } from '@unpopping-candy/ui';
import { PostComposerView, TimelineView, type SocialPostViewModel } from '@unpopping-candy/social';

export interface SocialFeedPageProps {
  posts: readonly SocialPostViewModel[];
  draft: string;
  loading?: boolean;
  loadingMore?: boolean;
  publishing?: boolean;
  error?: string | null;
  onDraftChange(value: string): void;
  onPublish(): void;
  onRetry(): void;
  onLoadMore?(): void;
}

export function SocialFeedPage({ posts, draft, loading, loadingMore, publishing, error, onDraftChange, onPublish, onRetry, onLoadMore }: SocialFeedPageProps) {
  return (
    <main className="popcandy-social-feed-page" aria-labelledby="social-feed-title">
      <Stack gap={0}>
        <header className="popcandy-social-feed-page__header"><h1 id="social-feed-title">Home</h1></header>
        <PostComposerView value={draft} pending={publishing} onChange={onDraftChange} onSubmit={onPublish} />
        {error && posts.length > 0 ? <Alert title="New posts could not be loaded" description={error} tone="warning" action={<Button onClick={onRetry}>Try again</Button>} /> : null}
        <TimelineView posts={posts} loading={loading} loadingMore={loadingMore} error={error} onRetry={onRetry} footer={onLoadMore ? <Button variant="ghost" onClick={onLoadMore}>Load more</Button> : null} />
      </Stack>
    </main>
  );
}
