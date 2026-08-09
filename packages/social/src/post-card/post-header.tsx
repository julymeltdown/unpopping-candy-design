import type { ReactNode } from 'react';
import { CheckCircleFilledIcon, MoreIcon } from '@unpopping-candy/icons';
import { IconButton } from '@unpopping-candy/ui';
import { formatRelativeTime } from '../lib/format.js';
import type { SocialUserViewModel } from '../model/types.js';

export interface PostHeaderProps {
  author: SocialUserViewModel;
  createdAt: string;
  onOpenAuthor?: (() => void) | undefined;
  onOpenMenu?: (() => void) | undefined;
  nowMs?: number | undefined;
  locale?: string | undefined;
}

function AuthorIdentity({ author, createdAt, locale, nowMs }: Pick<PostHeaderProps, 'author' | 'createdAt' | 'locale' | 'nowMs'>): ReactNode {
  return (
    <>
      <strong>{author.displayName}</strong>
      {author.verified ? <CheckCircleFilledIcon className="popcandy-post-header__verified" label="Verified" size="sm" /> : null}
      <span>@{author.handle}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={createdAt}>{formatRelativeTime(createdAt, nowMs, locale)}</time>
    </>
  );
}

export function PostHeader({ author, createdAt, locale, nowMs, onOpenAuthor, onOpenMenu }: PostHeaderProps) {
  const identity = <AuthorIdentity author={author} createdAt={createdAt} locale={locale} nowMs={nowMs} />;
  return (
    <header className="popcandy-post-header">
      {onOpenAuthor ? (
        <button type="button" className="popcandy-post-header__identity" onClick={onOpenAuthor}>{identity}</button>
      ) : (
        <div className="popcandy-post-header__identity popcandy-post-header__identity--static">{identity}</div>
      )}
      {onOpenMenu ? <IconButton size="sm" label="Post actions" icon={<MoreIcon />} onClick={onOpenMenu} /> : null}
    </header>
  );
}
