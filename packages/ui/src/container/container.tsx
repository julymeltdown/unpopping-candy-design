import type { HTMLAttributes } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'full' | undefined;
}
export function Container({ className, size = 'lg', ...props }: ContainerProps) {
  return <div {...props} className={mergeClassNames('cs-container', `cs-container--${size}`, className)} data-cs-size={size} />;
}
