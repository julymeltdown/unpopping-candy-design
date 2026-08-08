import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hideLabel?: boolean | undefined;
  description?: string | undefined;
  error?: string | undefined;
  counter?: { current: number; maximum: number } | undefined;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    { className, counter, description, error, hideLabel = false, id: providedId, label, ...props },
    ref,
  ) {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const counterId = counter ? `${id}-counter` : undefined;
    const describedBy = [descriptionId, errorId, counterId].filter(Boolean).join(' ') || undefined;

    return (
      <label
        className={mergeClassNames('cs-field', className)}
        htmlFor={id}
        data-cs-component="text-area"
        data-cs-state={error ? 'invalid' : props.disabled ? 'disabled' : 'valid'}
      >
        <span className={hideLabel ? 'cs-visually-hidden' : 'cs-field__label'}>{label}</span>
        <textarea
          {...props}
          ref={ref}
          id={id}
          className={mergeClassNames('cs-text-area', error && 'is-invalid')}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
        />
        {description ? <span id={descriptionId} className="cs-field__description">{description}</span> : null}
        <span className="cs-field__meta-row">
          {error ? <span id={errorId} className="cs-field__error" role="alert">{error}</span> : <span />}
          {counter ? (
            <span
              id={counterId}
              className={mergeClassNames('cs-field__counter', counter.current > counter.maximum && 'is-over-limit')}
              aria-live="polite"
            >
              {counter.current}/{counter.maximum}
            </span>
          ) : null}
        </span>
      </label>
    );
  },
);
