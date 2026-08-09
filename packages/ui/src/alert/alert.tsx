import type { HTMLAttributes, ReactNode } from 'react';
import { CloseIcon } from '@unpopping-candy/icons';
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
      className={mergeClassNames('popcandy-alert', `popcandy-alert--${tone}`, className)}
      data-popcandy-component="alert"
      data-popcandy-tone={tone}
      role={urgent ? 'alert' : 'status'}
      aria-atomic="true"
    >
      <div className="popcandy-alert__icon" aria-hidden="true">{icon ?? <FeedbackIcon tone={tone} />}</div>
      <div className="popcandy-alert__content">
        <div className="popcandy-alert__title">{title}</div>
        {description ? <div className="popcandy-alert__description">{description}</div> : null}
        {metadata ? <div className="popcandy-alert__metadata">{metadata}</div> : null}
        {action ? <div className="popcandy-alert__action">{action}</div> : null}
      </div>
      {onDismiss ? (
        <IconButton className="popcandy-alert__dismiss" size="sm" label={dismissLabel} icon={<CloseIcon />} onClick={onDismiss} />
      ) : null}
    </section>
  );
}
