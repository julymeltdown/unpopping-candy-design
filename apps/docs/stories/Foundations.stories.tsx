import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Inline, Stack, Surface } from '@commonspace/ui';

function Foundations() {
  return (
    <Stack gap={6} style={{ width: 760 }}>
      <div><h2 style={{ margin: 0 }}>Semantic roles</h2><p style={{ color: 'var(--cs-ink-muted)' }}>The theme changes roles, not component markup.</p></div>
      <div className="cs-docs-grid">
        {['canvas', 'surface', 'surface-muted', 'ink', 'ink-muted', 'border', 'accent', 'positive', 'warning', 'critical'].map((token) => (
          <Surface key={token} border padding="md" style={{ background: `var(--cs-${token})`, color: token.includes('ink') || ['accent', 'positive', 'critical', 'warning'].includes(token) ? 'white' : 'var(--cs-ink)' }}>
            <code>--cs-{token}</code>
          </Surface>
        ))}
      </div>
      <Inline gap={2}><Badge>Neutral</Badge><Badge tone="accent">Accent</Badge><Badge tone="positive">Positive</Badge><Badge tone="warning">Warning</Badge><Badge tone="critical">Critical</Badge></Inline>
    </Stack>
  );
}
const meta = { title: 'Foundations/Tokens', component: Foundations, parameters: { layout: 'padded' } } satisfies Meta<typeof Foundations>;
export default meta;
export const Overview: StoryObj<typeof meta> = {};
