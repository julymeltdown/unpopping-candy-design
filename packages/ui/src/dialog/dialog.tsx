import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react';
import { CloseIcon } from '@commonspace/icons';
import { IconButton } from '../icon-button/icon-button.js';
import { mergeClassNames } from '../lib/merge-class-names.js';
import { useControllableState } from '../lib/use-controllable-state.js';

export interface DialogProps {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  title: ReactNode;
  description?: ReactNode | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  className?: string | undefined;
  size?: 'sm' | 'md' | 'lg' | undefined;
  closeLabel?: string | undefined;
  dismissible?: boolean | undefined;
}

export function Dialog({
  children,
  className,
  closeLabel = 'Close dialog',
  defaultOpen = false,
  description,
  dismissible = true,
  footer,
  onOpenChange,
  open: controlledOpen,
  size = 'md',
  title,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [open, setOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={mergeClassNames('cs-dialog', `cs-dialog--${size}`, className)}
      data-cs-component="dialog"
      data-cs-size={size}
      data-cs-state={open ? 'open' : 'closed'}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={() => setOpen(false)}
      onCancel={(event: Event) => {
        if (!dismissible) return;
        event.preventDefault();
        setOpen(false);
      }}
      onClick={(event: MouseEvent<HTMLDialogElement>) => {
        if (dismissible && event.target === ref.current) setOpen(false);
      }}
    >
      <div className="cs-dialog__surface">
        <header className="cs-dialog__header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p id={descriptionId}>{description}</p> : null}
          </div>
          {dismissible ? <IconButton label={closeLabel} icon={<CloseIcon />} onClick={() => setOpen(false)} /> : null}
        </header>
        <div className="cs-dialog__content">{children}</div>
        {footer ? <footer className="cs-dialog__footer">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
