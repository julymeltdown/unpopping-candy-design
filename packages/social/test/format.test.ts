import assert from 'node:assert/strict';
import test from 'node:test';
import { formatCompactMetric, formatRelativeTime } from '../src/lib/format.ts';

test('formatCompactMetric clamps invalid and negative values', () => {
  assert.equal(formatCompactMetric(-4, 'en'), '0');
  assert.equal(formatCompactMetric(Number.NaN, 'en'), '0');
  assert.match(formatCompactMetric(1_200, 'en'), /1\.2K/i);
});

test('formatRelativeTime handles recent, old, and invalid timestamps', () => {
  const now = Date.parse('2026-08-09T00:00:00.000Z');
  assert.equal(formatRelativeTime('2026-08-08T23:59:30.000Z', now), '30s');
  assert.equal(formatRelativeTime('2026-08-08T22:00:00.000Z', now), '2h');
  assert.equal(formatRelativeTime('not-a-date', now), '');
});
