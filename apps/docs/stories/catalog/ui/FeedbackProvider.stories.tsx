import type { Meta, StoryObj } from '@storybook/react-vite';
import { CatalogFeedbackProvider } from '../fixtures';
const meta = { title: 'Catalog/UI/FeedbackProvider', component: CatalogFeedbackProvider } satisfies Meta<typeof CatalogFeedbackProvider>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
