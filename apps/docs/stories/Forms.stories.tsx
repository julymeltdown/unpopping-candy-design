import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchIcon } from '@unpopping-candy/icons';
import { Stack, TextArea, TextField } from '@unpopping-candy/ui';
function Forms() { return <Stack gap={4} style={{ width: 'min(100%, 440px)' }}><TextField label="Search" placeholder="People, posts, topics" leadingIcon={<SearchIcon />} description="Searches are applied by the consuming application." /><TextField label="Handle" defaultValue="popcandy" error="This handle is already in use." /><TextArea label="Post text" defaultValue="A reusable social surface with no data fetching inside." counter={{ current: 62, maximum: 500 }} /></Stack>; }
const meta = { title: 'UI/Forms', component: Forms } satisfies Meta<typeof Forms>;
export default meta;
export const States: StoryObj<typeof meta> = {};
