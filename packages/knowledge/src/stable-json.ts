function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return Object.fromEntries(Object.keys(record).sort().map((key) => [key, sortValue(record[key])]));
  }
  return value;
}
export function stableStringify(value: unknown): string { return `${JSON.stringify(sortValue(value), null, 2)}\n`; }
