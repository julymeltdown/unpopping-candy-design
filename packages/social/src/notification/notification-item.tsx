import type { HTMLAttributes } from 'react';
import { BellIcon, FollowIcon, HeartIcon, ReplyIcon, RepostIcon } from '@unpopping-candy/icons';
import { Avatar, Inline, Stack } from '@unpopping-candy/ui';
import { formatRelativeTime } from '../lib/format.js';
import type { SocialNotificationViewModel } from '../model/types.js';

export interface NotificationItemProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  notification: SocialNotificationViewModel;
  nowMs?: number | undefined;
  locale?: string | undefined;
  onSelect?: (() => void) | undefined;
}
function NotificationIcon({ type }: Pick<SocialNotificationViewModel, 'type'>) {
  switch (type) {
    case 'reply': case 'mention': return <ReplyIcon />;
    case 'like': return <HeartIcon />;
    case 'repost': return <RepostIcon />;
    case 'follow': return <FollowIcon />;
    default: return <BellIcon />;
  }
}
export function NotificationItem({ locale, notification, nowMs, onSelect, ...props }: NotificationItemProps) {
  const content = (
    <>
      <div className="popcandy-notification-item__icon" aria-hidden="true"><NotificationIcon type={notification.type} /></div>
      <Stack gap={2} className="popcandy-notification-item__content">
        <Inline gap={1}>{notification.actors.slice(0, 3).map((actor) => <Avatar key={actor.id} src={actor.avatarUrl} alt="" size="sm" />)}</Inline>
        <p>{notification.message}</p>
        {notification.post ? <blockquote>{notification.post.text}</blockquote> : null}
        <time dateTime={notification.createdAt}>{formatRelativeTime(notification.createdAt, nowMs, locale)}</time>
      </Stack>
    </>
  );
  const className = `popcandy-notification-item${notification.read ? '' : ' is-unread'}${props.className ? ` ${props.className}` : ''}`;
  return onSelect ? <button {...props as HTMLAttributes<HTMLButtonElement>} type="button" className={className} data-popcandy-component="notification-item" onClick={onSelect}>{content}</button> : <article {...props} className={className} data-popcandy-component="notification-item">{content}</article>;
}
