import type { CSSProperties, HTMLAttributes } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | undefined;
  align?: CSSProperties['alignItems'];
}
export function Stack({ align, className, gap = 4, style, ...props }: StackProps) {
  return <div {...props} className={mergeClassNames('popcandy-stack', className)} data-popcandy-gap={gap} style={{ ...style, alignItems: align }} />;
}
