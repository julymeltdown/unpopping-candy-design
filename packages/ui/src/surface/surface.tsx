import type { HTMLAttributes } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  tone?: 'base' | 'muted' | 'raised' | undefined;
  border?: boolean | undefined;
  padding?: 'none' | 'sm' | 'md' | 'lg' | undefined;
}
export function Surface({ border = false, className, padding = 'md', tone = 'base', ...props }: SurfaceProps) {
  return (
    <div
      {...props}
      className={mergeClassNames('cs-surface', `cs-surface--${tone}`, `cs-surface--padding-${padding}`, border && 'cs-surface--bordered', className)}
      data-cs-tone={tone}
      data-cs-padding={padding}
    />
  );
}
