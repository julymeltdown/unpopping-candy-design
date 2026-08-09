import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '@unpopping-candy/ui';
const meta = { title: 'Catalog/UI/Skeleton', component: Skeleton, args: { width: '18rem', height: '1.25rem' } } satisfies Meta<typeof Skeleton>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
