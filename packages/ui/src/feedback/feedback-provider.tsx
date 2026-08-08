import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  createFeedbackItem,
  dismissFeedbackItem,
  enqueueFeedbackItem,
  type FeedbackInput,
  type FeedbackItem,
} from './feedback-state.js';
import { ToastViewport } from './toast.js';

export interface FeedbackController {
  notify(input: FeedbackInput): string;
  dismiss(id: string): void;
  clear(): void;
}

const FeedbackContext = createContext<FeedbackController | null>(null);

function createFeedbackId(dedupeKey?: string | null): string {
  const normalizedKey = dedupeKey?.trim();
  if (normalizedKey) return `feedback:${normalizedKey}`;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `feedback-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface FeedbackProviderProps {
  children: ReactNode;
  maximumVisible?: number | undefined;
}

export function FeedbackProvider({
  children,
  maximumVisible = 4,
}: FeedbackProviderProps) {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const timerRef = useRef(new Map<string, { timer: ReturnType<typeof setTimeout>; createdAt: number }>());

  const controller = useMemo<FeedbackController>(() => ({
    notify(input) {
      const item = createFeedbackItem(input, {
        id: createFeedbackId(input.dedupeKey),
        now: Date.now(),
      });
      setItems((current) => enqueueFeedbackItem(current, item, maximumVisible));
      return item.id;
    },
    dismiss(id) {
      setItems((current) => dismissFeedbackItem(current, id) as FeedbackItem[]);
    },
    clear() {
      setItems([]);
    },
  }), [maximumVisible]);

  useEffect(() => {
    const activeIds = new Set(items.map((item) => item.id));
    for (const [id, scheduled] of timerRef.current) {
      const current = items.find((item) => item.id === id);
      if (!activeIds.has(id) || current?.createdAt !== scheduled.createdAt) {
        clearTimeout(scheduled.timer);
        timerRef.current.delete(id);
      }
    }

    for (const item of items) {
      if (item.durationMs === 0 || timerRef.current.has(item.id)) continue;
      const timer = setTimeout(() => controller.dismiss(item.id), item.durationMs);
      timerRef.current.set(item.id, { timer, createdAt: item.createdAt });
    }
  }, [controller, items]);

  useEffect(() => () => {
    for (const scheduled of timerRef.current.values()) clearTimeout(scheduled.timer);
    timerRef.current.clear();
  }, []);

  return (
    <FeedbackContext.Provider value={controller}>
      {children}
      <ToastViewport items={items} onDismiss={controller.dismiss} />
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackController {
  const controller = useContext(FeedbackContext);
  if (!controller) throw new Error('useFeedback must be used inside FeedbackProvider.');
  return controller;
}
