import { useState } from 'react';
import { Alert, Button, Container, Inline, Stack, Surface, Tabs } from '@unpopping-candy/ui';

const queue = [
  { id: 'case-1042', label: 'Potential impersonation', risk: 'High' },
  { id: 'case-1041', label: 'Targeted harassment report', risk: 'Medium' },
] as const;

export function ModerationWorkspace() {
  const [selected, setSelected] = useState(queue[0].id);
  const [tab, setTab] = useState<'evidence' | 'history'>('evidence');
  const current = queue.find((item) => item.id === selected) ?? queue[0];
  return (
    <Container size="full" className="popcandy-moderation-workspace">
      <aside aria-label="Moderation queue" className="popcandy-moderation-workspace__queue">
        <Stack gap={2}>{queue.map((item) => <Button key={item.id} variant={selected === item.id ? 'secondary' : 'ghost'} onClick={() => setSelected(item.id)}>{item.label}</Button>)}</Stack>
      </aside>
      <main className="popcandy-moderation-workspace__evidence" aria-labelledby="case-title">
        <Stack gap={4}>
          <header><p>{current.risk} risk</p><h1 id="case-title">{current.label}</h1></header>
          <Tabs ariaLabel="Case information" value={tab} onValueChange={setTab} items={[{ value: 'evidence', label: 'Evidence' }, { value: 'history', label: 'History' }]} />
          <Surface border padding="lg"><p>{tab === 'evidence' ? 'Present the reported content, surrounding context, and verified evidence here.' : 'Present prior decisions and appeal history here.'}</p></Surface>
        </Stack>
      </main>
      <aside aria-label="Decision controls" className="popcandy-moderation-workspace__decision">
        <Stack gap={4}>
          <Alert title="Decision requires a policy reference" description="Record scope, impact, notification, and appeal availability." tone="neutral" />
          <Inline><Button variant="secondary">No violation</Button><Button variant="danger">Remove content</Button></Inline>
        </Stack>
      </aside>
    </Container>
  );
}
