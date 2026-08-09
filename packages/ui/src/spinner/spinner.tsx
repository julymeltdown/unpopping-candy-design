import type { HTMLAttributes } from 'react';
import { LoadingIcon } from '@unpopping-candy/icons';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  label?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
}

export function Spinner({ className, label = 'Loading', size = 'md', ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      className={mergeClassNames('popcandy-spinner', `popcandy-spinner--${size}`, className)}
      data-popcandy-component="spinner"
      data-popcandy-size={size}
      role="status"
      aria-label={label}
    >
      <LoadingIcon aria-hidden="true" />
    </span>
  );
}
