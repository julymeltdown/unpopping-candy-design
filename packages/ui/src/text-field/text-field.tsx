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
        className={mergeClassNames('cs-field', className)}
        htmlFor={id}
        data-cs-component="text-field"
        data-cs-state={error ? 'invalid' : props.disabled ? 'disabled' : 'valid'}
      >
        <span className={hideLabel ? 'cs-visually-hidden' : 'cs-field__label'}>{label}</span>
        <span className={mergeClassNames('cs-field__control', error && 'is-invalid')}>
          {leadingIcon ? <span className="cs-field__icon">{leadingIcon}</span> : null}
          <input
            {...props}
            ref={ref}
            id={id}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
          />
          {trailingElement ? <span className="cs-field__trailing">{trailingElement}</span> : null}
        </span>
        {description ? <span id={descriptionId} className="cs-field__description">{description}</span> : null}
        {error ? <span id={errorId} className="cs-field__error" role="alert">{error}</span> : null}
      </label>
    );
  },
);
