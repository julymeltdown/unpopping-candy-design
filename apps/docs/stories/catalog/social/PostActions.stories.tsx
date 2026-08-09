import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostActions } from '@commonspace/social'; import { post } from '../fixtures';
const meta = { title: 'Catalog/Social/PostActions', component: PostActions, args: { metrics: post.metrics, viewerState: post.viewerState, onReply: () => undefined, onLike: () => undefined, onRepost: () => undefined, onBookmark: () => undefined, onShare: () => undefined } } satisfies Meta<typeof PostActions>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
