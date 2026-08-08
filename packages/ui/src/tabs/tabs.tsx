import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { mergeClassNames } from '../lib/merge-class-names.js';
import { useControllableState } from '../lib/use-controllable-state.js';

export interface TabItem<TValue extends string> {
  value: TValue;
  label: ReactNode;
  disabled?: boolean | undefined;
}

export interface TabsProps<TValue extends string> {
  ariaLabel: string;
  items: readonly TabItem<TValue>[];
  value?: TValue | undefined;
  defaultValue?: TValue | undefined;
  onValueChange?: ((value: TValue) => void) | undefined;
  className?: string | undefined;
  orientation?: 'horizontal' | 'vertical' | undefined;
  activationMode?: 'automatic' | 'manual' | undefined;
}

export function Tabs<TValue extends string>({
  activationMode = 'automatic',
  ariaLabel,
  className,
  defaultValue,
  items,
  onValueChange,
  orientation = 'horizontal',
  value: controlledValue,
}: TabsProps<TValue>) {
  const firstEnabled = items.find((item) => !item.disabled)?.value;
  if (!controlledValue && !defaultValue && !firstEnabled) {
    throw new Error('Tabs requires at least one enabled item or an explicit value.');
  }
  const id = useId();
  const refs = useRef(new Map<TValue, HTMLButtonElement>());
  const [value, setValue] = useControllableState({
    value: controlledValue,
    defaultValue: (defaultValue ?? firstEnabled) as TValue,
    onChange: onValueChange,
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const previousKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    if (![previousKey, nextKey, 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
    const enabled = items.filter((item) => !item.disabled);
    if (enabled.length === 0) return;
    const activeElement = document.activeElement;
    const focusedIndex = enabled.findIndex((item) => refs.current.get(item.value) === activeElement);
    const currentIndex = focusedIndex >= 0 ? focusedIndex : enabled.findIndex((item) => item.value === value);

    if ((event.key === 'Enter' || event.key === ' ') && activationMode === 'manual') {
      const focused = enabled[currentIndex];
      if (focused) {
        event.preventDefault();
        setValue(focused.value);
      }
      return;
    }

    if (![previousKey, nextKey, 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? enabled.length - 1
        : event.key === nextKey
          ? (currentIndex + 1 + enabled.length) % enabled.length
          : (currentIndex - 1 + enabled.length) % enabled.length;
    const next = enabled[nextIndex];
    if (!next) return;
    refs.current.get(next.value)?.focus();
    if (activationMode === 'automatic') setValue(next.value);
  };

  return (
    <div
      className={mergeClassNames('cs-tabs', `cs-tabs--${orientation}`, className)}
      data-cs-component="tabs"
      data-cs-orientation={orientation}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(node) => {
              if (node) refs.current.set(item.value, node);
              else refs.current.delete(item.value);
            }}
            id={`${id}-${item.value}-tab`}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            data-cs-state={selected ? 'selected' : item.disabled ? 'disabled' : 'idle'}
            className={mergeClassNames('cs-tabs__tab', selected && 'is-selected')}
            onClick={() => setValue(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
