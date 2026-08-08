import type { ReactNode } from 'react';
import { Button, EmptyState, Spinner } from '@commonspace/ui';
import type { SocialPostViewModel } from '../model/types.js';
import { PostCard, type PostCardProps } from '../post-card/post-card.js';
import { PostCardSkeleton } from '../post-card/post-card-skeleton.js';

export interface TimelineViewProps {
  posts: readonly SocialPostViewModel[];
  loading?: boolean | undefined;
  loadingMore?: boolean | undefined;
  error?: string | null | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  renderPostActions?(post: SocialPostViewModel): Omit<PostCardProps, 'post'>;
  renderPost?(post: SocialPostViewModel): ReactNode;
  footer?: ReactNode | undefined;
  onRetry?: (() => void) | undefined;
}
export function TimelineView({ emptyDescription = 'Follow people or return later when new posts are available.', emptyTitle = 'Nothing here yet', error, footer, loading = false, loadingMore = false, onRetry, posts, renderPost, renderPostActions }: TimelineViewProps) {
  if (loading && posts.length === 0) return <div className="cs-timeline" aria-label="Loading timeline">{Array.from({ length: 5 }, (_, index) => <PostCardSkeleton key={index} />)}</div>;
  if (error && posts.length === 0) return <EmptyState title="The timeline could not be loaded" description={error} action={onRetry ? <Button variant="secondary" onClick={onRetry}>Try again</Button> : null} />;
  if (posts.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;
  return (
    <div className="cs-timeline" data-cs-component="timeline" role="feed" aria-busy={loadingMore || undefined}>
      {posts.map((post) => renderPost ? <div key={post.id}>{renderPost(post)}</div> : <PostCard key={post.id} post={post} {...renderPostActions?.(post)} />)}
      {loadingMore ? <div className="cs-timeline__loading"><Spinner label="Loading more posts" /></div> : null}
      {footer}
    </div>
  );
}
