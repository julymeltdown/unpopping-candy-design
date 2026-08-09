import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator, Stack } from '@commonspace/ui';
const meta = { title: 'Catalog/UI/Separator', component: Separator } satisfies Meta<typeof Separator>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = { render: (args) => <Stack><span>Before</span><Separator {...args} /><span>After</span></Stack> };
