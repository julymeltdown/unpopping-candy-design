import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { EmojiIcon, MediaIcon } from '@unpopping-candy/icons';
import { Avatar, Button, IconButton, TextArea } from '@unpopping-candy/ui';
import type { SocialUserViewModel } from '../model/types.js';

export interface PostComposerViewProps {
  viewer: SocialUserViewModel;
  value: string;
  maximumLength?: number | undefined;
  pending?: boolean | undefined;
  error?: string | undefined;
  feedback?: ReactNode | undefined;
  placeholder?: string | undefined;
  submitLabel?: string | undefined;
  onValueChange(value: string): void;
  onSubmit(): void;
  onAddMedia?: (() => void) | undefined;
  onAddEmoji?: (() => void) | undefined;
}
export function PostComposerView({ error, feedback, maximumLength = 500, onAddEmoji, onAddMedia, onSubmit, onValueChange, pending = false, placeholder = 'What is happening?', submitLabel = 'Post', value, viewer }: PostComposerViewProps) {
  const overLimit = value.length > maximumLength;
  const unavailable = pending || overLimit || value.trim().length === 0;
  const submit = (event: FormEvent) => { event.preventDefault(); if (!unavailable) onSubmit(); };
  return (
    <form className="popcandy-composer" data-popcandy-component="post-composer" data-popcandy-state={pending ? 'pending' : overLimit ? 'invalid' : 'ready'} onSubmit={submit}>
      <Avatar src={viewer.avatarUrl} alt="" size="lg" />
      <div className="popcandy-composer__body">
        <TextArea label="Post text" hideLabel value={value} placeholder={placeholder} maxLength={maximumLength + 20} error={error} counter={{ current: value.length, maximum: maximumLength }} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onValueChange(event.target.value)} />
        {feedback ? <div className="popcandy-composer__feedback">{feedback}</div> : null}
        <div className="popcandy-composer__footer">
          <div className="popcandy-composer__tools" aria-label="Composer tools">
            {onAddMedia ? <IconButton label="Add media" icon={<MediaIcon />} onClick={onAddMedia} /> : null}
            {onAddEmoji ? <IconButton label="Add emoji" icon={<EmojiIcon />} onClick={onAddEmoji} /> : null}
          </div>
          <Button type="submit" variant="primary" pending={pending} disabled={unavailable}>{submitLabel}</Button>
        </div>
      </div>
    </form>
  );
}
