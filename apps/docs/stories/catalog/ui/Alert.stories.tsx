import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert } from '@commonspace/ui';
const meta = { title: 'Catalog/UI/Alert', component: Alert, args: { title: 'Changes were not saved', description: 'Your input remains available. Review the connection and try again.', tone: 'warning' } } satisfies Meta<typeof Alert>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
