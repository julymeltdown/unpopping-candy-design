import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Dialog } from '@unpopping-candy/ui';
const meta = { title: 'Catalog/UI/Dialog', component: Dialog, args: { defaultOpen: true, title: 'Publish edition', description: 'Confirm the public version before publishing.', children: <p>The current draft remains editable until publication.</p>, footer: <Button variant="primary">Publish</Button> } } satisfies Meta<typeof Dialog>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
