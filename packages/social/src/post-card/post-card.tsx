import type { MouseEvent } from 'react';
import { RepostIcon } from '@unpopping-candy/icons';
import { Avatar } from '@unpopping-candy/ui';
import type { SocialPostViewModel } from '../model/types.js';
import { PostActions, type PostActionsProps } from './post-actions.js';
import { PostHeader } from './post-header.js';
import { PostMediaGrid } from './post-media-grid.js';
import { QuotedPost } from './quoted-post.js';

export interface PostCardProps extends Pick<PostActionsProps, 'locale' | 'pendingAction' | 'onReply' | 'onLike' | 'onRepost' | 'onBookmark' | 'onShare'> {
  post: SocialPostViewModel;
  compact?: boolean | undefined;
  nowMs?: number | undefined;
  onOpenPost?: (() => void) | undefined;
  onOpenAuthor?: (() => void) | undefined;
  onOpenMenu?: (() => void) | undefined;
  onOpenMedia?: ((mediaId: string) => void) | undefined;
  onOpenQuotedPost?: (() => void) | undefined;
}

export function PostCard({ compact = false, locale, nowMs, onBookmark, onLike, onOpenAuthor, onOpenMedia, onOpenMenu, onOpenPost, onOpenQuotedPost, onReply, onRepost, onShare, pendingAction, post }: PostCardProps) {
  const hasActions = Boolean(onReply || onLike || onRepost || onBookmark || onShare);
  return (
    <article className={`popcandy-post-card${compact ? ' popcandy-post-card--compact' : ''}`} data-popcandy-component="post-card" data-popcandy-post-id={post.id}>
      {onOpenAuthor ? (
        <button type="button" className="popcandy-post-card__avatar-button" aria-label={`Open ${post.author.displayName}'s profile`} onClick={(event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); onOpenAuthor(); }}>
          <Avatar src={post.author.avatarUrl} alt="" size={compact ? 'md' : 'lg'} />
        </button>
      ) : (
        <span className="popcandy-post-card__avatar-button popcandy-post-card__avatar-button--static"><Avatar src={post.author.avatarUrl} alt={post.author.displayName} size={compact ? 'md' : 'lg'} /></span>
      )}
      <div className="popcandy-post-card__content">
        {post.timelineContext?.distribution.kind === 'repost' && post.timelineContext.distribution.actor ? (
          <p className="popcandy-post-card__timeline-context"><RepostIcon aria-hidden="true" size="sm" /><span>{post.timelineContext.distribution.actor.displayName} reposted</span></p>
        ) : post.timelineContext?.recommendationReason ? (
          <p className="popcandy-post-card__timeline-context popcandy-post-card__timeline-context--reason">{post.timelineContext.recommendationReason.label}</p>
        ) : null}
        {post.replyTo ? <p className="popcandy-post-card__context">Replying to <span>@{post.replyTo.handle}</span></p> : null}
        <PostHeader author={post.author} createdAt={post.createdAt} locale={locale} nowMs={nowMs} onOpenAuthor={onOpenAuthor} onOpenMenu={onOpenMenu} />
        {onOpenPost ? <button type="button" className="popcandy-post-card__text popcandy-post-card__text-button" onClick={onOpenPost}>{post.text}</button> : <div className="popcandy-post-card__text">{post.text}</div>}
        <PostMediaGrid media={post.media} onOpenMedia={onOpenMedia} />
        {post.quotedPost ? <QuotedPost post={post.quotedPost} onOpen={onOpenQuotedPost} /> : null}
        {hasActions ? <PostActions locale={locale} metrics={post.metrics} viewerState={post.viewerState} pendingAction={pendingAction} onReply={onReply} onLike={onLike} onRepost={onRepost} onBookmark={onBookmark} onShare={onShare} /> : null}
      </div>
    </article>
  );
}
