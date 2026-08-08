import type { HTMLAttributes } from 'react';
import { LoadingIcon } from '@commonspace/icons';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  label?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
}

export function Spinner({ className, label = 'Loading', size = 'md', ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      className={mergeClassNames('cs-spinner', `cs-spinner--${size}`, className)}
      data-cs-component="spinner"
      data-cs-size={size}
      role="status"
      aria-label={label}
    >
      <LoadingIcon aria-hidden="true" />
    </span>
  );
}
