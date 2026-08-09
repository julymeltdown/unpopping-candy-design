import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tabs } from '@commonspace/ui';
const meta = { title: 'Catalog/UI/Tabs', component: Tabs, args: { ariaLabel: 'Profile sections', defaultValue: 'editions', items: [{ value: 'editions', label: 'Editions' }, { value: 'archives', label: 'Archives' }] } } satisfies Meta<typeof Tabs>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
