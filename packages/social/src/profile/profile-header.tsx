import type { ReactNode } from 'react';
import { CalendarIcon, LinkIcon, LocationIcon } from '@unpopping-candy/icons';
import { Avatar, Button, Inline, Stack } from '@unpopping-candy/ui';
import { formatCompactMetric } from '../lib/format.js';
import type { SocialProfileViewModel } from '../model/types.js';

export interface ProfileHeaderProps {
  profile: SocialProfileViewModel;
  locale?: string | undefined;
  primaryAction?: ReactNode | undefined;
  onOpenFollowers?: (() => void) | undefined;
  onOpenFollowing?: (() => void) | undefined;
}
export function ProfileHeader({ locale, onOpenFollowers, onOpenFollowing, primaryAction, profile }: ProfileHeaderProps) {
  const { user } = profile;
  return (
    <section className="popcandy-profile-header" data-popcandy-component="profile-header">
      <div className="popcandy-profile-header__cover" style={profile.coverUrl ? { backgroundImage: `url(${profile.coverUrl})` } : undefined} />
      <div className="popcandy-profile-header__main">
        <div className="popcandy-profile-header__avatar-row"><Avatar src={user.avatarUrl} alt={user.displayName} size="xl" />{primaryAction}</div>
        <Stack gap={2}>
          <div><h1>{user.displayName}</h1><p className="popcandy-profile-header__handle">@{user.handle}</p></div>
          {user.bio ? <p className="popcandy-profile-header__bio">{user.bio}</p> : null}
          <Inline gap={4} className="popcandy-profile-header__metadata">
            {profile.location ? <span><LocationIcon size="sm" />{profile.location}</span> : null}
            {profile.website ? <a href={profile.website}><LinkIcon size="sm" />{profile.website.replace(/^https?:\/\//, '')}</a> : null}
            {profile.joinedLabel ? <span><CalendarIcon size="sm" />{profile.joinedLabel}</span> : null}
          </Inline>
          <Inline gap={4} className="popcandy-profile-header__counts">
            <Button variant="ghost" size="sm" onClick={onOpenFollowing}><strong>{formatCompactMetric(profile.following, locale)}</strong> Following</Button>
            <Button variant="ghost" size="sm" onClick={onOpenFollowers}><strong>{formatCompactMetric(profile.followers, locale)}</strong> Followers</Button>
          </Inline>
        </Stack>
      </div>
    </section>
  );
}
