import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogComposer } from '../fixtures';
const meta = { title: 'Catalog/Social/PostComposerView', component: CatalogComposer } satisfies Meta<typeof CatalogComposer>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
