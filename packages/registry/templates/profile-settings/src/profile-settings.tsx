import { useState, type FormEvent } from 'react';
import { Alert, Button, Inline, Stack, TextArea, TextField } from '@commonspace/ui';

export const profileSettingsComponentName = '{{componentPrefix}}ProfileSettings';

export interface ProfileSettingsValue {
  displayName: string;
  bio: string;
}

export interface ProfileSettingsProps {
  initialValue: ProfileSettingsValue;
  pending?: boolean;
  error?: string | null;
  onSave(value: ProfileSettingsValue): void | Promise<void>;
}

export function ProfileSettings({ initialValue, pending = false, error, onSave }: ProfileSettingsProps) {
  const [value, setValue] = useState(initialValue);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void onSave({ displayName: value.displayName.trim(), bio: value.bio.trim() });
  };
  return (
    <form onSubmit={submit} aria-busy={pending || undefined}>
      <Stack gap={5}>
        {error ? <Alert tone="critical" title="Profile changes were not saved" description={error} /> : null}
        <TextField label="Display name" value={value.displayName} maxLength={80} required onChange={(event) => setValue((current) => ({ ...current, displayName: event.target.value }))} />
        <TextArea label="Bio" value={value.bio} maxLength={240} counter={{ current: value.bio.length, maximum: 240 }} onChange={(event) => setValue((current) => ({ ...current, bio: event.target.value }))} />
        <Inline justify="flex-end">
          <Button type="submit" variant="primary" pending={pending} pendingLabel="Saving profile">Save changes</Button>
        </Inline>
      </Stack>
    </form>
  );
}
