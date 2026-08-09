import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Inline } from '@unpopping-candy/ui';
const meta = { title: 'Catalog/UI/Inline', component: Inline, args: { gap: 3 } } satisfies Meta<typeof Inline>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = { render: (args) => <Inline {...args}><Button>Cancel</Button><Button variant="primary">Save</Button></Inline> };
