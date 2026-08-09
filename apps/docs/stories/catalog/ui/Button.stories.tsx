import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@commonspace/ui';
const meta = { title: 'Catalog/UI/Button', component: Button, args: { children: 'Continue', variant: 'primary' } } satisfies Meta<typeof Button>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
