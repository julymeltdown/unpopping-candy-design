import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container, Surface } from '@commonspace/ui';
const meta = { title: 'Catalog/UI/Container', component: Container, args: { size: 'md' } } satisfies Meta<typeof Container>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = { render: (args) => <Container {...args}><Surface border>Container content</Surface></Container> };
