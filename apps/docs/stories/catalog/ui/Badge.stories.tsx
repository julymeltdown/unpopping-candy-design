import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@unpopping-candy/ui';
const meta = { title: 'Catalog/UI/Badge', component: Badge, args: { children: 'Editorial review', tone: 'accent' } } satisfies Meta<typeof Badge>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
