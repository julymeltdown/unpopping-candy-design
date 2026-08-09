import type { Meta, StoryObj } from '@storybook/react-vite';
import { Surface } from '@unpopping-candy/ui';
const meta = { title: 'Catalog/UI/Surface', component: Surface, args: { border: true, padding: 'lg', children: 'A bounded region with deliberate visual weight.' } } satisfies Meta<typeof Surface>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
