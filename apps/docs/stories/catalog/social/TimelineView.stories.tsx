import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimelineView } from '@unpopping-candy/social'; import { post } from '../fixtures';
const meta = { title: 'Catalog/Social/TimelineView', component: TimelineView, args: { posts: [post] } } satisfies Meta<typeof TimelineView>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
