import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';
import { Spinner } from '../spinner/spinner.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | undefined;
  size?: ButtonSize | undefined;
  fullWidth?: boolean | undefined;
  pending?: boolean | undefined;
  pendingLabel?: string | undefined;
  leadingIcon?: ReactNode | undefined;
  trailingIcon?: ReactNode | undefined;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled,
    fullWidth = false,
    leadingIcon,
    pending = false,
    pendingLabel = 'Working',
    size = 'md',
    trailingIcon,
    type = 'button',
    variant = 'secondary',
    ...props
  },
  ref,
) {
  const unavailable = disabled || pending;
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={unavailable}
      aria-busy={pending || undefined}
      data-popcandy-component="button"
      data-popcandy-variant={variant}
      data-popcandy-size={size}
      data-popcandy-state={pending ? 'pending' : unavailable ? 'disabled' : 'ready'}
      className={mergeClassNames(
        'popcandy-button',
        `popcandy-button--${variant}`,
        `popcandy-button--${size}`,
        fullWidth && 'popcandy-button--full',
        className,
      )}
    >
      {pending ? <Spinner size="sm" label={pendingLabel} /> : leadingIcon}
      <span className="popcandy-button__label">{pending ? pendingLabel : children}</span>
      {!pending ? trailingIcon : null}
    </button>
  );
});
