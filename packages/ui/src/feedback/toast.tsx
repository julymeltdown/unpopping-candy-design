import { CloseIcon } from '@commonspace/icons';
import { Button } from '../button/button.js';
import { IconButton } from '../icon-button/icon-button.js';
import { FeedbackIcon } from './feedback-icon.js';
import type { FeedbackItem } from './feedback-state.js';

export interface ToastProps {
  item: FeedbackItem;
  onDismiss(id: string): void;
}

export function Toast({ item, onDismiss }: ToastProps) {
  const urgent = item.tone === 'critical' || item.tone === 'warning';
  return (
    <article
      className={`cs-toast cs-toast--${item.tone}`}
      role={urgent ? 'alert' : 'status'}
      aria-atomic="true"
    >
      <div className="cs-toast__icon" aria-hidden="true">
        <FeedbackIcon tone={item.tone} />
      </div>
      <div className="cs-toast__content">
        <div className="cs-toast__title-row">
          <strong>{item.title}</strong>
          {item.count > 1 ? <span>Repeated {item.count} times</span> : null}
        </div>
        {item.description ? <p>{item.description}</p> : null}
        {item.action ? (
          <Button
            className="cs-toast__action"
            variant="ghost"
            size="sm"
            onClick={() => {
              item.action?.onSelect();
              onDismiss(item.id);
            }}
          >
            {item.action.label}
          </Button>
        ) : null}
      </div>
      <IconButton
        className="cs-toast__dismiss"
        size="sm"
        label={`Dismiss ${item.title}`}
        icon={<CloseIcon />}
        onClick={() => onDismiss(item.id)}
      />
    </article>
  );
}

export interface ToastViewportProps {
  items: readonly FeedbackItem[];
  onDismiss(id: string): void;
}

export function ToastViewport({ items, onDismiss }: ToastViewportProps) {
  if (items.length === 0) return null;
  return (
    <aside className="cs-toast-viewport" aria-label="Application notifications">
      {items.map((item) => (
        <Toast key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </aside>
  );
}
