import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, Button, Stack, useFeedback } from '@commonspace/ui';

function FeedbackDemo() {
  const feedback = useFeedback();
  return (
    <Stack gap={4} style={{ width: 620 }}>
      <Alert title="Post was not published" description="Your draft is still available. Review the connection and try again." tone="critical" metadata="Request req_01J9" action={<Button size="sm">Try again</Button>} />
      <Alert title="Connection restored" description="New requests can be sent again." tone="success" />
      <Button onClick={() => feedback.notify({ title: 'Saved to collection', description: 'The item remains available in its original context.', tone: 'success' })}>Show toast</Button>
    </Stack>
  );
}
const meta = { title: 'UI/Feedback', component: FeedbackDemo } satisfies Meta<typeof FeedbackDemo>;
export default meta;
export const Surfaces: StoryObj<typeof meta> = {};
