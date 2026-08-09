import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchIcon } from '@commonspace/icons'; import { IconButton } from '@commonspace/ui';
const meta = { title: 'Catalog/UI/IconButton', component: IconButton, args: { label: 'Search', icon: <SearchIcon />, tone: 'neutral' } } satisfies Meta<typeof IconButton>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
