import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, Surface } from '@commonspace/ui';
const meta = { title: 'Catalog/UI/Stack', component: Stack, args: { gap: 4 } } satisfies Meta<typeof Stack>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = { render: (args) => <Stack {...args}><Surface border>First</Surface><Surface border>Second</Surface></Stack> };
