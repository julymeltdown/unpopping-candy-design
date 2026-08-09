import type { HTMLAttributes } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'accent' | 'positive' | 'warning' | 'critical' | undefined;
  size?: 'sm' | 'md' | undefined;
}

export function Badge({ className, size = 'md', tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      {...props}
      data-popcandy-component="badge"
      data-popcandy-size={size}
      data-popcandy-tone={tone}
      className={mergeClassNames('popcandy-badge', `popcandy-badge--${tone}`, `popcandy-badge--${size}`, className)}
    />
  );
}
