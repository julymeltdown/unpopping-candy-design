import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from '@unpopping-candy/ui';
const meta = { title: 'Catalog/UI/TextField', component: TextField, args: { label: 'Edition title', defaultValue: 'Civic Type in Seoul', description: 'Use a specific title rather than a category label.' } } satisfies Meta<typeof TextField>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
