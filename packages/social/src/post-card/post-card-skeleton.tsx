import { Skeleton } from '@unpopping-candy/ui';
export function PostCardSkeleton() {
  return (
    <div className="popcandy-post-card popcandy-post-card--skeleton" aria-hidden="true">
      <Skeleton width={48} height={48} radius="50%" />
      <div className="popcandy-post-card__content">
        <Skeleton width="42%" height={14} />
        <Skeleton width="94%" height={16} />
        <Skeleton width="72%" height={16} />
        <div className="popcandy-post-card-skeleton__actions"><Skeleton width={52} height={28} radius={999} /><Skeleton width={52} height={28} radius={999} /><Skeleton width={52} height={28} radius={999} /></div>
      </div>
    </div>
  );
}
