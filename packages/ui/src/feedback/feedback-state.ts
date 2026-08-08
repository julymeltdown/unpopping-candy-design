export type FeedbackTone = 'neutral' | 'success' | 'warning' | 'critical';

const MAX_TRANSIENT_DURATION_MS = 60_000;
const FEEDBACK_TONES = new Set<FeedbackTone>(['neutral', 'success', 'warning', 'critical']);

export interface FeedbackAction {
  label: string;
  onSelect(): void;
}

export interface FeedbackInput {
  title: string;
  description?: string | null | undefined;
  tone?: FeedbackTone | undefined;
  durationMs?: number | undefined;
  dedupeKey?: string | null | undefined;
  action?: FeedbackAction | null | undefined;
}

export interface FeedbackItem {
  id: string;
  title: string;
  description: string | null;
  tone: FeedbackTone;
  durationMs: number;
  dedupeKey: string | null;
  count: number;
  createdAt: number;
  action: FeedbackAction | null;
}

function trimmedOrNull(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizedTone(value: unknown): FeedbackTone {
  const tone = value ?? 'neutral';
  if (typeof tone !== 'string' || !FEEDBACK_TONES.has(tone as FeedbackTone)) {
    throw new TypeError('Feedback tone is not supported.');
  }
  return tone as FeedbackTone;
}

function normalizedDuration(value: number | undefined, tone: FeedbackTone): number {
  if (value === undefined) return feedbackDurationForTone(tone);
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError('Feedback duration must be a finite non-negative number.');
  }
  if (value > MAX_TRANSIENT_DURATION_MS) {
    throw new TypeError(`Feedback duration must not exceed ${MAX_TRANSIENT_DURATION_MS} milliseconds.`);
  }
  return Math.round(value);
}

function normalizedAction(value: FeedbackAction | null | undefined): FeedbackAction | null {
  if (value == null) return null;
  const label = trimmedOrNull(value.label);
  if (!label) throw new TypeError('Feedback action label must not be empty.');
  if (typeof value.onSelect !== 'function') {
    throw new TypeError('Feedback action callback must be a function.');
  }
  return { label, onSelect: value.onSelect };
}

export function feedbackDurationForTone(tone: FeedbackTone): number {
  switch (tone) {
    case 'critical':
      return 0;
    case 'warning':
      return 7_000;
    case 'success':
      return 4_500;
    default:
      return 5_500;
  }
}

export function createFeedbackItem(
  input: FeedbackInput,
  identity: { id: string; now: number },
): FeedbackItem {
  const title = trimmedOrNull(input.title);
  if (!title) throw new TypeError('Feedback title must not be empty.');

  const id = identity.id.trim();
  if (!id) throw new TypeError('Feedback ID must not be empty.');
  if (!Number.isFinite(identity.now)) throw new TypeError('Feedback timestamp must be finite.');

  const tone = normalizedTone(input.tone);
  return {
    id,
    title,
    description: trimmedOrNull(input.description),
    tone,
    durationMs: normalizedDuration(input.durationMs, tone),
    dedupeKey: trimmedOrNull(input.dedupeKey),
    count: 1,
    createdAt: identity.now,
    action: normalizedAction(input.action),
  };
}

export function enqueueFeedbackItem(
  queue: readonly FeedbackItem[],
  next: FeedbackItem,
  maximumVisible = 4,
): FeedbackItem[] {
  if (!Number.isFinite(maximumVisible) || maximumVisible < 0) {
    throw new TypeError('Feedback maximum visible count must be finite and non-negative.');
  }
  const maximum = Math.floor(maximumVisible);
  if (maximum === 0) return [];

  if (next.dedupeKey) {
    const existingIndex = queue.findIndex((item) => item.dedupeKey === next.dedupeKey);
    if (existingIndex >= 0) {
      const existing = queue[existingIndex];
      if (!existing) return [...queue];
      const updated: FeedbackItem = {
        ...next,
        id: existing.id,
        count: existing.count + 1,
      };
      return queue.map((item, index) => (index === existingIndex ? updated : item));
    }
  }

  const result = [...queue, next];
  while (result.length > maximum) {
    const nonCriticalIndex = result.findIndex((item) => item.tone !== 'critical');
    result.splice(nonCriticalIndex >= 0 ? nonCriticalIndex : 0, 1);
  }
  return result;
}

export function dismissFeedbackItem(
  queue: readonly FeedbackItem[],
  id: string,
): FeedbackItem[] | readonly FeedbackItem[] {
  const index = queue.findIndex((item) => item.id === id);
  if (index < 0) return queue;
  return queue.filter((item) => item.id !== id);
}
