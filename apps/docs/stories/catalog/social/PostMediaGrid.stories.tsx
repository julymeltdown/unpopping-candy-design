import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostMediaGrid } from '@unpopping-candy/social'; import { media } from '../fixtures';
const meta = { title: 'Catalog/Social/PostMediaGrid', component: PostMediaGrid, args: { media, onOpenMedia: () => undefined } } satisfies Meta<typeof PostMediaGrid>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
