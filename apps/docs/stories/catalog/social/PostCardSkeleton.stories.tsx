import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostCardSkeleton } from '@commonspace/social';
const meta = { title: 'Catalog/Social/PostCardSkeleton', component: PostCardSkeleton } satisfies Meta<typeof PostCardSkeleton>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
