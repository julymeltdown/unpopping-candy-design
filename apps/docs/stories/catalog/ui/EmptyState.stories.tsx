import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, EmptyState } from '@commonspace/ui';
const meta = { title: 'Catalog/UI/EmptyState', component: EmptyState, args: { title: 'No editions yet', description: 'Publish a selected sequence from an archive.', action: <Button>Create edition</Button> } } satisfies Meta<typeof EmptyState>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
