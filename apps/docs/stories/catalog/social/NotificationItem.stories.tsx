import type { Meta, StoryObj } from '@storybook/react-vite';
import { NotificationItem } from '@commonspace/social'; import { notification, FIXED_NOW } from '../fixtures';
const meta = { title: 'Catalog/Social/NotificationItem', component: NotificationItem, args: { notification, nowMs: FIXED_NOW } } satisfies Meta<typeof NotificationItem>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
