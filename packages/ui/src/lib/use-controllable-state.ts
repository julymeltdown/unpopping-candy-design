import { useCallback, useState } from 'react';

export interface ControllableStateOptions<T> {
  value?: T | undefined;
  defaultValue: T;
  onChange?: ((value: T) => void) | undefined;
}

export function useControllableState<T>({
  defaultValue,
  onChange,
  value,
}: ControllableStateOptions<T>): readonly [T, (value: T) => void] {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internalValue;
  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setInternalValue(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );
  return [current, setValue] as const;
}
