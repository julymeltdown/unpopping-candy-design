import type { Meta, StoryObj } from '@storybook/react-vite';
import { PostHeader } from '@commonspace/social'; import { hanna, FIXED_NOW } from '../fixtures';
const meta = { title: 'Catalog/Social/PostHeader', component: PostHeader, args: { author: hanna, createdAt: '2026-08-09T00:00:00.000Z', nowMs: FIXED_NOW, onOpenMenu: () => undefined } } satisfies Meta<typeof PostHeader>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
