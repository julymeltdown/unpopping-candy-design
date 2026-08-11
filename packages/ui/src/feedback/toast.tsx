import { CloseIcon } from '@unpopping-candy/icons';
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
    <div
      className={`popcandy-toast popcandy-toast--${item.tone}`}
      role={urgent ? 'alert' : 'status'}
      aria-atomic="true"
    >
      <div className="popcandy-toast__icon" aria-hidden="true">
        <FeedbackIcon tone={item.tone} />
      </div>
      <div className="popcandy-toast__content">
        <div className="popcandy-toast__title-row">
          <strong>{item.title}</strong>
          {item.count > 1 ? <span>Repeated {item.count} times</span> : null}
        </div>
        {item.description ? <p>{item.description}</p> : null}
        {item.action ? (
          <Button
            className="popcandy-toast__action"
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
        className="popcandy-toast__dismiss"
        size="sm"
        label={`Dismiss ${item.title}`}
        icon={<CloseIcon />}
        onClick={() => onDismiss(item.id)}
      />
    </div>
  );
}

export interface ToastViewportProps {
  items: readonly FeedbackItem[];
  onDismiss(id: string): void;
}

export function ToastViewport({ items, onDismiss }: ToastViewportProps) {
  if (items.length === 0) return null;
  return (
    <aside className="popcandy-toast-viewport" aria-label="Application notifications">
      {items.map((item) => (
        <Toast key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </aside>
  );
}
