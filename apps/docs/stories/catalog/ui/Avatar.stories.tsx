import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '@unpopping-candy/ui';
const meta = { title: 'Catalog/UI/Avatar', component: Avatar, args: { src: 'https://i.pravatar.cc/160?img=47', alt: 'Hanna Lee', size: 'lg' } } satisfies Meta<typeof Avatar>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
