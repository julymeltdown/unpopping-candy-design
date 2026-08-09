import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '@unpopping-candy/ui'; import { ProfileHeader } from '@unpopping-candy/social'; import { profile } from '../fixtures';
const meta = { title: 'Catalog/Social/ProfileHeader', component: ProfileHeader, args: { profile, primaryAction: <Button>Edit profile</Button> } } satisfies Meta<typeof ProfileHeader>;
export default meta; type Story = StoryObj<typeof meta>; export const Contract: Story = {};
