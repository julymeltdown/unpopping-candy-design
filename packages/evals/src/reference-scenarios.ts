import type { AgentEvaluationScenario } from './types.ts';

const task = 'Build a profile settings form with loading, error, empty, disabled, and pending behavior.';
const expectedComponents = ['ui.alert', 'ui.button', 'ui.empty-state', 'ui.stack', 'ui.text-field'] as const;

export const referenceAgentScenarios: readonly AgentEvaluationScenario[] = [
  {
    id: 'profile-settings-no-context',
    mode: 'none',
    task,
    requiredStates: ['loading', 'error', 'empty'],
    expectedComponents,
    files: [{
      path: 'src/profile-settings.tsx',
      content: `export const ProfileSettings = () => <div style={{ color: '#444444', padding: '24px' }}><input /><button><span /></button></div>;`,
    }],
  },
  {
    id: 'profile-settings-design-md',
    mode: 'design-md',
    task,
    requiredStates: ['loading', 'error', 'empty'],
    expectedComponents,
    files: [{
      path: 'src/profile-settings.tsx',
      content: `import { Button, Stack, TextField } from '@unpopping-candy/ui';
export function ProfileSettings({ loading }) {
  if (loading) return <p role="status">Loading profile</p>;
  return <form aria-label="Profile settings"><Stack style={{ gap: '17px' }}><TextField label="Display name" /><Button type="submit">Save profile</Button></Stack></form>;
}`,
    }],
  },
  {
    id: 'profile-settings-skill',
    mode: 'skill',
    task,
    requiredStates: ['loading', 'error', 'empty'],
    expectedComponents,
    files: [{
      path: 'src/profile-settings.tsx',
      content: `import { Alert, Button, Stack, TextField } from '@unpopping-candy/ui';
export function ProfileSettings({ loading, error }) {
  if (loading) return <p role="status">Loading profile</p>;
  if (error) return <Alert tone="critical" title="Profile unavailable" description="Existing information remains unchanged." />;
  return <form aria-label="Profile settings"><Stack><TextField label="Display name" /><Button type="submit">Save profile</Button></Stack></form>;
}`,
    }],
  },
  {
    id: 'profile-settings-mcp',
    mode: 'mcp',
    task,
    requiredStates: ['loading', 'error', 'empty'],
    expectedComponents,
    files: [{
      path: 'src/profile-settings.tsx',
      content: `import { Alert, Button, EmptyState, Stack, TextField } from '@unpopping-candy/ui';
export function ProfileSettings({ loading, error, profiles }) {
  if (loading) return <p role="status">Loading profile</p>;
  if (error) return <Alert tone="critical" title="Profile unavailable" description="Existing information remains unchanged." />;
  if (profiles.length === 0) return <EmptyState title="No profile" description="Create a profile before editing it." />;
  return <form aria-label="Profile settings"><Stack><TextField label="Display name" /><Button type="submit">Save profile</Button></Stack></form>;
}`,
    }],
  },
  {
    id: 'profile-settings-skill-mcp',
    mode: 'skill-mcp',
    task,
    requiredStates: ['loading', 'error', 'empty', 'disabled', 'pending'],
    expectedComponents,
    files: [{
      path: 'src/profile-settings.tsx',
      content: `import { Alert, Button, EmptyState, Stack, TextField } from '@unpopping-candy/ui';
export function ProfileSettings({ loading, error, profiles, pending, canEdit }) {
  if (loading) return <p role="status">Loading profile</p>;
  if (error) return <Alert tone="critical" title="Profile unavailable" description="Existing information remains unchanged." />;
  if (profiles.length === 0) return <EmptyState title="No profile" description="Create a profile before editing it." />;
  return <form aria-label="Profile settings"><Stack><TextField label="Display name" disabled={!canEdit} /><Button type="submit" pending={pending} disabled={!canEdit}>Save profile</Button></Stack></form>;
}`,
    }],
  },
  {
    id: 'profile-settings-skill-mcp-storybook',
    mode: 'skill-mcp-storybook',
    task,
    requiredStates: ['loading', 'error', 'empty', 'disabled', 'pending'],
    expectedComponents,
    files: [{
      path: 'src/profile-settings.tsx',
      content: `import { Alert, Button, EmptyState, Stack, TextField } from '@unpopping-candy/ui';
export function ProfileSettings({ loading, error, profiles, pending, canEdit }) {
  if (loading) return <p role="status" aria-live="polite">Loading profile</p>;
  if (error) return <Alert tone="critical" title="Profile unavailable" description="Existing information remains unchanged. Retry when the connection recovers." />;
  if (profiles.length === 0) return <EmptyState title="No profile" description="Create a profile before editing it." action={<Button>Create profile</Button>} />;
  return <form aria-label="Profile settings"><Stack><TextField label="Display name" description="Shown beside your published work." disabled={!canEdit} /><Button type="submit" pending={pending} pendingLabel="Saving profile" disabled={!canEdit}>Save profile</Button></Stack></form>;
}`,
    }],
  },
] as const;
