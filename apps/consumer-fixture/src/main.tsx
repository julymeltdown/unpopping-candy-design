import { createRoot } from 'react-dom/client';
import '@unpopping-candy/tokens/styles.css';
import '@unpopping-candy/icons/styles.css';
import '@unpopping-candy/ui/styles.css';
import '@unpopping-candy/social/styles.css';
import { UnpoppingCandyProvider } from '@unpopping-candy/theme';
import { Button } from '@unpopping-candy/ui/button';
import type { SocialPostViewModel } from '@unpopping-candy/social/model';
import { PostCard } from '@unpopping-candy/social/post';
const post: SocialPostViewModel = { id: 'fixture', author: { id: 'user', handle: 'fixture', displayName: 'Consumer Fixture' }, text: 'This app resolves only package export maps and built dist files.', createdAt: new Date(0).toISOString(), media: [], metrics: { replies: 0, reposts: 0, likes: 0, bookmarks: 0 }, viewerState: { liked: false, reposted: false, bookmarked: false } };
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Missing #root application mount.');
}

createRoot(rootElement).render(<UnpoppingCandyProvider theme="light"><PostCard post={post} /><Button>Consumer action</Button></UnpoppingCandyProvider>);
