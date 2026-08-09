import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Stack, Surface } from '@unpopping-candy/ui';
import { ConversationPreview, NotificationItem, PostCard, PostComposerView, ProfileHeader, type SocialPostViewModel, type SocialProfileViewModel, type SocialUserViewModel } from '@unpopping-candy/social';

const hanna: SocialUserViewModel = { id: 'u1', handle: 'hanna', displayName: 'Hanna Lee', avatarUrl: 'https://i.pravatar.cc/160?img=47', verified: true, bio: 'Independent curator and interface researcher.' };
const mina: SocialUserViewModel = { id: 'u2', handle: 'minapark', displayName: 'Mina Park', avatarUrl: 'https://i.pravatar.cc/160?img=32' };
const post: SocialPostViewModel = { id: 'p1', author: hanna, text: 'A design system becomes useful when product semantics survive outside the application that created it.', createdAt: '2026-08-09T00:00:00.000Z', media: [{ id: 'm1', kind: 'image', url: 'https://picsum.photos/id/1048/1200/760', alt: 'Concrete architecture with directional signage', width: 1200, height: 760 }], metrics: { replies: 18, reposts: 42, likes: 318, bookmarks: 77 }, viewerState: { liked: false, reposted: false, bookmarked: true }, timelineContext: { distribution: { kind: 'repost', actor: mina, activityId: 'r1', distributedAt: '2026-08-09T00:03:00.000Z' } } };
const profile: SocialProfileViewModel = { user: hanna, coverUrl: 'https://picsum.photos/id/1031/1400/400', location: 'Seoul', website: 'https://popcandy.example', joinedLabel: 'Joined August 2026', followers: 1482, following: 218, posts: 48, viewerRelationship: 'self' };
function SocialGallery() {
  const [value, setValue] = useState('');
  return <Stack gap={6} style={{ width: 'min(100%, 680px)' }}><Surface border padding="none"><PostComposerView viewer={hanna} value={value} onValueChange={setValue} onSubmit={() => setValue('')} onAddMedia={() => undefined} /></Surface><Surface border padding="none"><PostCard post={post} nowMs={Date.parse('2026-08-09T00:10:00.000Z')} onLike={() => undefined} onRepost={() => undefined} onBookmark={() => undefined} onReply={() => undefined} onShare={() => undefined} /></Surface><Surface border padding="none"><ProfileHeader profile={profile} primaryAction={<Button variant="secondary">Edit profile</Button>} /></Surface><Surface border padding="none"><NotificationItem notification={{ id: 'n1', type: 'repost', actors: [mina], message: 'Mina Park reposted your post.', createdAt: '2026-08-09T00:05:00.000Z', read: false, post: { id: post.id, author: post.author, text: post.text, media: [] } }} nowMs={Date.parse('2026-08-09T00:10:00.000Z')} /><ConversationPreview conversation={{ id: 'c1', participants: [mina], title: 'Mina Park', lastMessage: 'The source package is now decoupled from the API DTO.', updatedAt: '2026-08-09T00:08:00.000Z', unreadCount: 2 }} nowMs={Date.parse('2026-08-09T00:10:00.000Z')} /></Surface></Stack>;
}
const meta = { title: 'Social/Pattern gallery', component: SocialGallery, parameters: { layout: 'padded' } } satisfies Meta<typeof SocialGallery>;
export default meta;
export const Overview: StoryObj<typeof meta> = {};
