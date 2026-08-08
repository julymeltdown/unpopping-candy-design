import { Skeleton } from '@commonspace/ui';
export function PostCardSkeleton() {
  return (
    <div className="cs-post-card cs-post-card--skeleton" aria-hidden="true">
      <Skeleton width={48} height={48} radius="50%" />
      <div className="cs-post-card__content">
        <Skeleton width="42%" height={14} />
        <Skeleton width="94%" height={16} />
        <Skeleton width="72%" height={16} />
        <div className="cs-post-card-skeleton__actions"><Skeleton width={52} height={28} radius={999} /><Skeleton width={52} height={28} radius={999} /><Skeleton width={52} height={28} radius={999} /></div>
      </div>
    </div>
  );
}
