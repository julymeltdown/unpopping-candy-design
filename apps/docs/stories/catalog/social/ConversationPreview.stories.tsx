import type { Meta, StoryObj } from '@storybook/react-vite';
import { ConversationPreview } from '@unpopping-candy/social'; import { conversation, FIXED_NOW } from '../fixtures';
const meta = { title: 'Catalog/Social/ConversationPreview', component: ConversationPreview, args: { conversation, nowMs: FIXED_NOW } } satisfies Meta<typeof ConversationPreview>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
