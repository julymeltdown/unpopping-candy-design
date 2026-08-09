import { useMemo, useState } from 'react';
import { MoonIcon, SettingsIcon } from './local-icons';
import { UnpoppingCandyProvider, useUnpoppingCandyTheme } from '@unpopping-candy/theme';
import { Button, Container, FeedbackProvider, Inline, Stack, Surface, Tabs } from '@unpopping-candy/ui';
import { PostCard, PostComposerView, ProfileHeader, type SocialPostViewModel, type SocialProfileViewModel, type SocialUserViewModel } from '@unpopping-candy/social';

const hanna: SocialUserViewModel = { id: 'hanna', handle: 'hanna', displayName: 'Hanna Lee', avatarUrl: 'https://i.pravatar.cc/160?img=47', verified: true, bio: 'Independent curator and interface researcher.' };
const profile: SocialProfileViewModel = { user: hanna, coverUrl: 'https://picsum.photos/id/1031/1600/500', location: 'Seoul', website: 'https://popcandy.example', joinedLabel: 'Joined August 2026', followers: 1482, following: 218, posts: 48, viewerRelationship: 'self' };
const posts: SocialPostViewModel[] = [
  { id: 'one', author: hanna, text: 'Unpopping Candy keeps content, state, and application architecture in separate layers.', createdAt: '2026-08-09T00:00:00.000Z', media: [{ id: 'media-one', kind: 'image', url: 'https://picsum.photos/id/1048/1200/760', alt: 'Concrete building and signage', width: 1200, height: 760 }], metrics: { replies: 18, reposts: 42, likes: 318, bookmarks: 77 }, viewerState: { liked: false, reposted: false, bookmarked: true } },
  { id: 'two', author: { id: 'mina', handle: 'minapark', displayName: 'Mina Park', avatarUrl: 'https://i.pravatar.cc/160?img=32' }, text: 'The social package accepts presentation models and callbacks. It has no knowledge of an API client or cache.', createdAt: '2026-08-09T00:03:00.000Z', media: [], metrics: { replies: 5, reposts: 11, likes: 96, bookmarks: 22 }, viewerState: { liked: true, reposted: false, bookmarked: false }, timelineContext: { distribution: { kind: 'repost', actor: hanna, activityId: 'activity', distributedAt: '2026-08-09T00:04:00.000Z' } } },
];
function PlaygroundContent() {
  const theme = useUnpoppingCandyTheme();
  const [tab, setTab] = useState<'feed' | 'profile'>('feed');
  const [draft, setDraft] = useState('');
  const now = useMemo(() => Date.parse('2026-08-09T00:10:00.000Z'), []);
  return <><header className="playground-header"><strong>UNPOPPING CANDY</strong><Inline gap={2}><Button size="sm" variant="ghost" leadingIcon={<MoonIcon />} onClick={() => theme.setTheme(theme.theme === 'dark' ? 'light' : 'dark')}>{theme.theme}</Button><Button size="sm" variant="ghost" leadingIcon={<SettingsIcon />} onClick={() => theme.setDensity(theme.density === 'compact' ? 'comfortable' : 'compact')}>{theme.density}</Button></Inline></header><Container size="md"><Stack gap={6} className="playground-main"><div><h1>Content-rich interfaces without application lock-in.</h1><p>These surfaces are rendered entirely from package view models and local callbacks.</p></div><Tabs ariaLabel="Playground sections" value={tab} onValueChange={setTab} items={[{ value: 'feed', label: 'Social feed' }, { value: 'profile', label: 'Profile' }]} />{tab === 'feed' ? <Surface border padding="none"><PostComposerView viewer={hanna} value={draft} onValueChange={setDraft} onSubmit={() => setDraft('')} onAddMedia={() => undefined} />{posts.map((post) => <PostCard key={post.id} post={post} nowMs={now} onLike={() => undefined} onRepost={() => undefined} onBookmark={() => undefined} onReply={() => undefined} onShare={() => undefined} />)}</Surface> : <Surface border padding="none"><ProfileHeader profile={profile} primaryAction={<Button variant="secondary">Edit profile</Button>} /></Surface>}</Stack></Container></>;
}
export function App() { return <UnpoppingCandyProvider defaultTheme="light" scope="local" className="playground-root"><FeedbackProvider><PlaygroundContent /></FeedbackProvider></UnpoppingCandyProvider>; }
