import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchIcon } from '@commonspace/icons';
import { Stack, TextArea, TextField } from '@commonspace/ui';
function Forms() { return <Stack gap={4} style={{ width: 440 }}><TextField label="Search" placeholder="People, posts, topics" leadingIcon={<SearchIcon />} description="Searches are applied by the consuming application." /><TextField label="Handle" defaultValue="commonspace" error="This handle is already in use." /><TextArea label="Post text" defaultValue="A reusable social surface with no data fetching inside." counter={{ current: 62, maximum: 500 }} /></Stack>; }
const meta = { title: 'UI/Forms', component: Forms } satisfies Meta<typeof Forms>;
export default meta;
export const States: StoryObj<typeof meta> = {};
