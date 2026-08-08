import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlusIcon, ShareIcon } from '@commonspace/icons';
import { Button, Inline, Stack } from '@commonspace/ui';

const meta = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Continue' },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Pending: Story = { args: { variant: 'primary', pending: true, pendingLabel: 'Publishing' } };
export const WithIcons: Story = { args: { leadingIcon: <PlusIcon />, trailingIcon: <ShareIcon /> } };
export const Matrix: Story = {
  render: () => <Stack gap={4}>{(['sm', 'md', 'lg'] as const).map((size) => <Inline key={size} gap={3}><Button size={size} variant="primary">Primary</Button><Button size={size}>Secondary</Button><Button size={size} variant="ghost">Ghost</Button><Button size={size} variant="danger">Danger</Button></Inline>)}</Stack>,
};
