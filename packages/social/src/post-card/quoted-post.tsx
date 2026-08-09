import type { ReactNode } from 'react';
import type { SocialPostSummary } from '../model/types.js';
import { PostMediaGrid } from './post-media-grid.js';

export interface QuotedPostProps { post: SocialPostSummary; onOpen?: (() => void) | undefined; }
function QuotedPostContent({ post }: { post: SocialPostSummary }): ReactNode {
  return (
    <>
      <span className="popcandy-quoted-post__identity"><strong>{post.author.displayName}</strong><span>@{post.author.handle}</span></span>
      <span className="popcandy-quoted-post__text">{post.text}</span>
      <PostMediaGrid media={post.media.slice(0, 1)} />
    </>
  );
}
export function QuotedPost({ onOpen, post }: QuotedPostProps) {
  return onOpen ? (
    <button type="button" className="popcandy-quoted-post" onClick={onOpen}><QuotedPostContent post={post} /></button>
  ) : (
    <div className="popcandy-quoted-post popcandy-quoted-post--static"><QuotedPostContent post={post} /></div>
  );
}
