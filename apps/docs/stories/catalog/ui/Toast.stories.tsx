import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast, createFeedbackItem } from '@commonspace/ui';
const item = createFeedbackItem({ title: 'Connected to archive', description: 'The original source remains attached.', tone: 'success' }, { id: 'toast-contract', now: 1 });
const meta = { title: 'Catalog/UI/Toast', component: Toast, args: { item, onDismiss: () => undefined } } satisfies Meta<typeof Toast>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
