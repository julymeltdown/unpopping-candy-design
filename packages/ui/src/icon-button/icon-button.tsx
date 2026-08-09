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
        data-popcandy-component="icon-button"
        data-popcandy-size={size}
        data-popcandy-tone={tone}
        data-popcandy-state={selected ? 'selected' : props.disabled ? 'disabled' : 'idle'}
        className={mergeClassNames(
          'popcandy-icon-button',
          `popcandy-icon-button--${size}`,
          `popcandy-icon-button--${tone}`,
          selected && 'is-selected',
          className,
        )}
      >
        {icon}
      </button>
    );
  },
);
