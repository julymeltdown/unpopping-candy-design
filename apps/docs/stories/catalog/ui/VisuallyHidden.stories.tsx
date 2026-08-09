import type { Meta, StoryObj } from '@storybook/react-vite';
import { VisuallyHidden } from '@commonspace/ui';
const meta = { title: 'Catalog/UI/VisuallyHidden', component: VisuallyHidden, args: { children: 'Additional screen-reader context' } } satisfies Meta<typeof VisuallyHidden>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = { render: (args) => <p>Visible label<VisuallyHidden {...args} /></p> };
