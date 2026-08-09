import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToastViewport, createFeedbackItem } from '@unpopping-candy/ui';
const items = [createFeedbackItem({ title: 'Saved', tone: 'success' }, { id: 'one', now: 1 }), createFeedbackItem({ title: 'Connection lost', description: 'Your draft remains available.', tone: 'warning' }, { id: 'two', now: 2 })];
const meta = { title: 'Catalog/UI/ToastViewport', component: ToastViewport, args: { items, onDismiss: () => undefined } } satisfies Meta<typeof ToastViewport>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
