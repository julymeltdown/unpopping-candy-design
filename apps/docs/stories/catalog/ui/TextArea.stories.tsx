import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from '@unpopping-candy/ui';
const meta = { title: 'Catalog/UI/TextArea', component: TextArea, args: { label: 'Curator note', defaultValue: 'Explain why this item belongs in the sequence.', counter: { current: 52, maximum: 240 } } } satisfies Meta<typeof TextArea>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
