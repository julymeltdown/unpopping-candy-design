import type { HTMLAttributes } from 'react';
import { Avatar, Badge } from '@unpopping-candy/ui';
import { formatRelativeTime } from '../lib/format.js';
import type { SocialConversationPreviewViewModel } from '../model/types.js';

export interface ConversationPreviewProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'title'> {
  conversation: SocialConversationPreviewViewModel;
  locale?: string | undefined;
  nowMs?: number | undefined;
}
export function ConversationPreview({ conversation, locale, nowMs, ...props }: ConversationPreviewProps) {
  const lead = conversation.participants[0];
  return (
    <button {...props} type="button" className={`popcandy-conversation-preview${conversation.unreadCount > 0 ? ' is-unread' : ''}${props.className ? ` ${props.className}` : ''}`} data-popcandy-component="conversation-preview">
      <Avatar src={lead?.avatarUrl} alt="" size="lg" />
      <div className="popcandy-conversation-preview__content"><div><strong>{conversation.title}</strong><time dateTime={conversation.updatedAt}>{formatRelativeTime(conversation.updatedAt, nowMs, locale)}</time></div><p>{conversation.lastMessage}</p></div>
      {conversation.unreadCount > 0 ? <Badge tone="accent" size="sm">{conversation.unreadCount}</Badge> : null}
    </button>
  );
}
