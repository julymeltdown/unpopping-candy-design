import type { HTMLAttributes, ReactNode } from 'react';
import { Avatar, Button } from '@unpopping-candy/ui';
import type { SocialUserViewModel } from '../model/types.js';

export interface UserCellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  user: SocialUserViewModel;
  description?: ReactNode | undefined;
  actionLabel?: string | undefined;
  actionPending?: boolean | undefined;
  onSelect?: (() => void) | undefined;
  onAction?: (() => void) | undefined;
}
export function UserCell({ actionLabel, actionPending, description, onAction, onSelect, user, ...props }: UserCellProps) {
  const identity = <><strong>{user.displayName}</strong><span>@{user.handle}</span></>;
  return (
    <div {...props} className={`popcandy-user-cell${props.className ? ` ${props.className}` : ''}`} data-popcandy-component="user-cell">
      <Avatar src={user.avatarUrl} alt="" size="lg" />
      <div className="popcandy-user-cell__body">
        {onSelect ? <button type="button" className="popcandy-user-cell__identity" onClick={onSelect}>{identity}</button> : <div className="popcandy-user-cell__identity popcandy-user-cell__identity--static">{identity}</div>}
        {description ?? user.bio ? <div className="popcandy-user-cell__description">{description ?? user.bio}</div> : null}
      </div>
      {actionLabel && onAction ? <Button size="sm" variant="secondary" pending={actionPending} onClick={onAction}>{actionLabel}</Button> : null}
    </div>
  );
}
