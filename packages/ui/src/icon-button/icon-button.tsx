import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg' | undefined;
  tone?: 'neutral' | 'accent' | 'danger' | undefined;
  selected?: boolean | undefined;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      className,
      icon,
      label,
      selected = false,
      size = 'md',
      tone = 'neutral',
      type = 'button',
      ...props
    },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        aria-label={label}
        aria-pressed={selected || undefined}
        title={label}
        data-cs-component="icon-button"
        data-cs-size={size}
        data-cs-tone={tone}
        data-cs-state={selected ? 'selected' : props.disabled ? 'disabled' : 'idle'}
        className={mergeClassNames(
          'cs-icon-button',
          `cs-icon-button--${size}`,
          `cs-icon-button--${tone}`,
          selected && 'is-selected',
          className,
        )}
      >
        {icon}
      </button>
    );
  },
);
