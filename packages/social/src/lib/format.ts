export function formatCompactMetric(value: number, locale = 'en'): string {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  return new Intl.NumberFormat(locale, {
    notation: safe >= 1_000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(safe);
}

export function formatRelativeTime(isoDate: string, nowMs = Date.now(), locale = 'en'): string {
  const targetMs = Date.parse(isoDate);
  if (!Number.isFinite(targetMs)) return '';
  const elapsedSeconds = Math.max(0, Math.floor((nowMs - targetMs) / 1_000));
  if (elapsedSeconds < 60) return `${elapsedSeconds}s`;
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(targetMs);
}
