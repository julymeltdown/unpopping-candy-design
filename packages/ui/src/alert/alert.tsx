import type { HTMLAttributes, ReactNode } from 'react';
import { CloseIcon } from '@commonspace/icons';
import { FeedbackIcon } from '../feedback/feedback-icon.js';
import type { FeedbackTone } from '../feedback/feedback-state.js';
import { IconButton } from '../icon-button/icon-button.js';
import { mergeClassNames } from '../lib/merge-class-names.js';

export interface AlertProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode;
  description?: ReactNode | undefined;
  tone?: FeedbackTone | undefined;
  action?: ReactNode | undefined;
  metadata?: ReactNode | undefined;
  icon?: ReactNode | undefined;
  dismissLabel?: string | undefined;
  onDismiss?: (() => void) | undefined;
}

export function Alert({
  action,
  className,
  description,
  dismissLabel = 'Dismiss notification',
  icon,
  metadata,
  onDismiss,
  title,
  tone = 'neutral',
  ...props
}: AlertProps) {
  const urgent = tone === 'critical' || tone === 'warning';
  return (
    <section
      {...props}
      className={mergeClassNames('cs-alert', `cs-alert--${tone}`, className)}
      data-cs-component="alert"
      data-cs-tone={tone}
      role={urgent ? 'alert' : 'status'}
      aria-atomic="true"
    >
      <div className="cs-alert__icon" aria-hidden="true">{icon ?? <FeedbackIcon tone={tone} />}</div>
      <div className="cs-alert__content">
        <div className="cs-alert__title">{title}</div>
        {description ? <div className="cs-alert__description">{description}</div> : null}
        {metadata ? <div className="cs-alert__metadata">{metadata}</div> : null}
        {action ? <div className="cs-alert__action">{action}</div> : null}
      </div>
      {onDismiss ? (
        <IconButton className="cs-alert__dismiss" size="sm" label={dismissLabel} icon={<CloseIcon />} onClick={onDismiss} />
      ) : null}
    </section>
  );
}
