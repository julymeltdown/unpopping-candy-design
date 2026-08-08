import type { MouseEvent, ReactNode } from 'react';
import {
  BookmarkFilledIcon,
  BookmarkIcon,
  HeartFilledIcon,
  HeartIcon,
  ReplyIcon,
  RepostIcon,
  ShareIcon,
} from '@commonspace/icons';
import { IconButton } from '@commonspace/ui';
import { formatCompactMetric } from '../lib/format.js';
import type { SocialPostMetrics, SocialPostViewerState } from '../model/types.js';

export interface PostActionsProps {
  metrics: SocialPostMetrics;
  viewerState: SocialPostViewerState;
  locale?: string | undefined;
  disabled?: boolean | undefined;
  pendingAction?: 'like' | 'bookmark' | 'repost' | null | undefined;
  onReply?: (() => void) | undefined;
  onLike?: (() => void) | undefined;
  onRepost?: (() => void) | undefined;
  onBookmark?: (() => void) | undefined;
  onShare?: (() => void) | undefined;
}

interface MetricActionProps {
  label: string;
  value: number;
  selected?: boolean | undefined;
  tone?: 'neutral' | 'accent' | 'danger' | undefined;
  disabled?: boolean | undefined;
  icon: ReactNode;
  onClick?: (() => void) | undefined;
  locale?: string | undefined;
}

function MetricAction({ disabled, icon, label, locale, onClick, selected, tone, value }: MetricActionProps) {
  return (
    <span className="cs-post-action">
      <IconButton
        size="sm"
        label={label}
        icon={icon}
        selected={selected}
        tone={tone}
        disabled={disabled || !onClick}
        onClick={(event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); onClick?.(); }}
      />
      {value > 0 ? <span aria-hidden="true">{formatCompactMetric(value, locale)}</span> : null}
    </span>
  );
}

export function PostActions({ disabled, locale, metrics, onBookmark, onLike, onReply, onRepost, onShare, pendingAction, viewerState }: PostActionsProps) {
  return (
    <footer className="cs-post-actions" aria-label="Post engagement" data-cs-component="post-actions">
      <MetricAction label="Reply" icon={<ReplyIcon />} value={metrics.replies} locale={locale} disabled={disabled} onClick={onReply} />
      <MetricAction label={viewerState.reposted ? 'Undo repost' : 'Repost'} icon={<RepostIcon />} value={metrics.reposts} locale={locale} selected={viewerState.reposted} tone="accent" disabled={disabled || pendingAction === 'repost'} onClick={onRepost} />
      <MetricAction label={viewerState.liked ? 'Unlike' : 'Like'} icon={viewerState.liked ? <HeartFilledIcon /> : <HeartIcon />} value={metrics.likes} locale={locale} selected={viewerState.liked} tone="danger" disabled={disabled || pendingAction === 'like'} onClick={onLike} />
      <MetricAction label={viewerState.bookmarked ? 'Remove bookmark' : 'Bookmark'} icon={viewerState.bookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />} value={metrics.bookmarks} locale={locale} selected={viewerState.bookmarked} tone="accent" disabled={disabled || pendingAction === 'bookmark'} onClick={onBookmark} />
      <IconButton size="sm" label="Share" icon={<ShareIcon />} disabled={disabled || !onShare} onClick={(event: MouseEvent<HTMLButtonElement>) => { event.stopPropagation(); onShare?.(); }} />
    </footer>
  );
}
