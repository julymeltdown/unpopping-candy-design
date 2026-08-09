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
      className={mergeClassNames('popcandy-surface', `popcandy-surface--${tone}`, `popcandy-surface--padding-${padding}`, border && 'popcandy-surface--bordered', className)}
      data-popcandy-tone={tone}
      data-popcandy-padding={padding}
    />
  );
}
