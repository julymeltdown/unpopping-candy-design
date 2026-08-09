import { useState } from 'react';
import { Button, FeedbackProvider, useFeedback } from '@commonspace/ui';
import { PostComposerView, type SocialConversationPreviewViewModel, type SocialNotificationViewModel, type SocialPostViewModel, type SocialProfileViewModel, type SocialUserViewModel } from '@commonspace/social';

export const FIXED_NOW = Date.parse('2026-08-09T00:10:00.000Z');
export const hanna: SocialUserViewModel = { id: 'u1', handle: 'hanna', displayName: 'Hanna Lee', avatarUrl: 'https://i.pravatar.cc/160?img=47', verified: true, bio: 'Independent curator and interface researcher.' };
export const mina: SocialUserViewModel = { id: 'u2', handle: 'minapark', displayName: 'Mina Park', avatarUrl: 'https://i.pravatar.cc/160?img=32', bio: 'Collecting civic graphics and architectural references.' };
export const media = [{ id: 'm1', kind: 'image' as const, url: 'https://picsum.photos/id/1048/1200/760', alt: 'Concrete architecture with directional signage', width: 1200, height: 760 }];
export const post: SocialPostViewModel = {
  id: 'p1', author: hanna, text: 'A design system becomes useful when product semantics survive outside the application that created it.', createdAt: '2026-08-09T00:00:00.000Z', media,
  metrics: { replies: 18, reposts: 42, likes: 318, bookmarks: 77 }, viewerState: { liked: false, reposted: false, bookmarked: true },
  timelineContext: { distribution: { kind: 'repost', actor: mina, activityId: 'r1', distributedAt: '2026-08-09T00:03:00.000Z' } },
};
export const profile: SocialProfileViewModel = { user: hanna, coverUrl: 'https://picsum.photos/id/1031/1400/400', location: 'Seoul', website: 'https://commonspace.example', joinedLabel: 'Joined August 2026', followers: 1482, following: 218, posts: 48, viewerRelationship: 'self' };
export const notification: SocialNotificationViewModel = { id: 'n1', type: 'repost', actors: [mina], message: 'Mina Park reposted your post.', createdAt: '2026-08-09T00:05:00.000Z', read: false, post: { id: post.id, author: post.author, text: post.text, media: [] } };
export const conversation: SocialConversationPreviewViewModel = { id: 'c1', participants: [mina], title: 'Mina Park', lastMessage: 'The source package is decoupled from the API DTO.', updatedAt: '2026-08-09T00:08:00.000Z', unreadCount: 2 };

export function CatalogFeedbackProviderDemo() {
  const feedback = useFeedback();
  return <Button onClick={() => feedback.notify({ title: 'Saved', description: 'The change is available in this session.', tone: 'success' })}>Show feedback</Button>;
}
export function CatalogFeedbackProvider() { return <FeedbackProvider><CatalogFeedbackProviderDemo /></FeedbackProvider>; }
export function CatalogComposer() {
  const [value, setValue] = useState('A complete story keeps state ownership outside the presentation component.');
  return <PostComposerView viewer={hanna} value={value} onValueChange={setValue} onSubmit={() => undefined} onAddMedia={() => undefined} />;
}
