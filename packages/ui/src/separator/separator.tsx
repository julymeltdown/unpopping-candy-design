import type { HTMLAttributes } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface SeparatorProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical' | undefined;
}
export function Separator({ className, orientation = 'horizontal', ...props }: SeparatorProps) {
  return <hr {...props} className={mergeClassNames('cs-separator', `cs-separator--${orientation}`, className)} aria-orientation={orientation} />;
}
