import type { CSSProperties, HTMLAttributes } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface InlineProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | undefined;
  align?: CSSProperties['alignItems'];
  justify?: CSSProperties['justifyContent'];
  wrap?: boolean | undefined;
}
export function Inline({ align = 'center', className, gap = 3, justify, style, wrap = true, ...props }: InlineProps) {
  return (
    <div
      {...props}
      className={mergeClassNames('popcandy-inline', className)}
      data-popcandy-gap={gap}
      data-popcandy-wrap={wrap ? 'wrap' : 'nowrap'}
      style={{ ...style, alignItems: align, justifyContent: justify }}
    />
  );
}
