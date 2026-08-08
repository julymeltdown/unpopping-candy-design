import type { HTMLAttributes, ReactNode } from 'react';
import { UserIcon } from '@commonspace/icons';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  src?: string | null | undefined;
  alt?: string | undefined;
  fallback?: ReactNode | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl' | undefined;
  loading?: 'eager' | 'lazy' | undefined;
}

export function Avatar({
  alt = '',
  className,
  fallback,
  loading = 'lazy',
  size = 'md',
  src,
  ...props
}: AvatarProps) {
  return (
    <span
      {...props}
      data-cs-component="avatar"
      data-cs-size={size}
      className={mergeClassNames('cs-avatar', `cs-avatar--${size}`, className)}
    >
      {src ? (
        <img src={src} alt={alt} loading={loading} decoding="async" />
      ) : fallback ? (
        <span className="cs-avatar__fallback">{fallback}</span>
      ) : (
        <UserIcon aria-hidden="true" />
      )}
    </span>
  );
}
