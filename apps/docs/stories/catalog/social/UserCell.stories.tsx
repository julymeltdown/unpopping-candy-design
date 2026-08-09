import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserCell } from '@unpopping-candy/social'; import { mina } from '../fixtures';
const meta = { title: 'Catalog/Social/UserCell', component: UserCell, args: { user: mina, actionLabel: 'Follow', onAction: () => undefined } } satisfies Meta<typeof UserCell>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
