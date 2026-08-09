import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchIcon } from '@unpopping-candy/icons'; import { IconButton } from '@unpopping-candy/ui';
const meta = { title: 'Catalog/UI/IconButton', component: IconButton, args: { label: 'Search', icon: <SearchIcon />, tone: 'neutral' } } satisfies Meta<typeof IconButton>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
