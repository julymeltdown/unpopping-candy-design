import type { CSSProperties, HTMLAttributes } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  radius?: CSSProperties['borderRadius'];
}

export function Skeleton({ className, height, radius, style, width, ...props }: SkeletonProps) {
  return (
    <span
      {...props}
      className={mergeClassNames('cs-skeleton', className)}
      data-cs-component="skeleton"
      aria-hidden="true"
      style={{ ...style, width, height, borderRadius: radius }}
    />
  );
}
