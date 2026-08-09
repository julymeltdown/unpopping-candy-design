import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean | undefined;
  description?: string | undefined;
  error?: string | undefined;
  leadingIcon?: ReactNode | undefined;
  trailingElement?: ReactNode | undefined;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      className,
      description,
      error,
      hideLabel = false,
      id: providedId,
      label,
      leadingIcon,
      trailingElement,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <label
        className={mergeClassNames('popcandy-field', className)}
        htmlFor={id}
        data-popcandy-component="text-field"
        data-popcandy-state={error ? 'invalid' : props.disabled ? 'disabled' : 'valid'}
      >
        <span className={hideLabel ? 'popcandy-visually-hidden' : 'popcandy-field__label'}>{label}</span>
        <span className={mergeClassNames('popcandy-field__control', error && 'is-invalid')}>
          {leadingIcon ? <span className="popcandy-field__icon">{leadingIcon}</span> : null}
          <input
            {...props}
            ref={ref}
            id={id}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
          />
          {trailingElement ? <span className="popcandy-field__trailing">{trailingElement}</span> : null}
        </span>
        {description ? <span id={descriptionId} className="popcandy-field__description">{description}</span> : null}
        {error ? <span id={errorId} className="popcandy-field__error" role="alert">{error}</span> : null}
      </label>
    );
  },
);
