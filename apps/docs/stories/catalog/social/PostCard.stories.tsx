import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCard } from '@unpopping-candy/social'; import { post, FIXED_NOW } from '../fixtures';
const meta = { title: 'Catalog/Social/PostCard', component: PostCard, args: { post, nowMs: FIXED_NOW, onReply: () => undefined, onLike: () => undefined, onRepost: () => undefined, onBookmark: () => undefined, onShare: () => undefined } } satisfies Meta<typeof PostCard>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
