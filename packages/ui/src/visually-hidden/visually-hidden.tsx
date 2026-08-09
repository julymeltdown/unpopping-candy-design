import type { HTMLAttributes } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export function VisuallyHidden({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={mergeClassNames('popcandy-visually-hidden', className)} />;
}
