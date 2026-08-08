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
      data-cs-component="badge"
      data-cs-size={size}
      data-cs-tone={tone}
      className={mergeClassNames('cs-badge', `cs-badge--${tone}`, `cs-badge--${size}`, className)}
    />
  );
}
