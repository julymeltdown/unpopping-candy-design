import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner } from '@unpopping-candy/ui';
const meta = { title: 'Catalog/UI/Spinner', component: Spinner, args: { label: 'Loading archive', size: 'md' } } satisfies Meta<typeof Spinner>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
