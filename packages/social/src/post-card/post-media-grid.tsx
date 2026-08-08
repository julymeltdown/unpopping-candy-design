import type { ReactNode } from 'react';
import type { SocialMediaViewModel } from '../model/types.js';

export interface PostMediaGridProps {
  media: readonly SocialMediaViewModel[];
  onOpenMedia?: ((mediaId: string) => void) | undefined;
}

function MediaVisual({ item }: { item: SocialMediaViewModel }): ReactNode {
  return item.kind === 'image' ? (
    <img src={item.url} alt={item.alt} loading="lazy" decoding="async" />
  ) : (
    <video src={item.url} poster={item.posterUrl ?? undefined} aria-label={item.alt} preload="metadata" />
  );
}

export function PostMediaGrid({ media, onOpenMedia }: PostMediaGridProps) {
  if (media.length === 0) return null;
  const visible = media.slice(0, 4);
  return (
    <div className={`cs-post-media cs-post-media--${visible.length}`} data-cs-component="post-media-grid">
      {visible.map((item) => {
        const safeWidth = Math.max(1, item.width);
        const safeHeight = Math.max(1, item.height);
        const style = { aspectRatio: `${safeWidth} / ${safeHeight}` };
        return onOpenMedia ? (
          <button key={item.id} type="button" className="cs-post-media__item" onClick={() => onOpenMedia(item.id)} style={style}>
            <MediaVisual item={item} />
          </button>
        ) : (
          <div key={item.id} className="cs-post-media__item cs-post-media__item--static" style={style}>
            <MediaVisual item={item} />
          </div>
        );
      })}
    </div>
  );
}
