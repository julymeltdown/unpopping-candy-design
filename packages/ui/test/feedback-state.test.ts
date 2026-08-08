import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createFeedbackItem,
  dismissFeedbackItem,
  enqueueFeedbackItem,
  feedbackDurationForTone,
} from '../src/feedback/feedback-state.ts';

test('feedback defaults keep critical errors persistent and confirmations temporary', () => {
  assert.equal(feedbackDurationForTone('critical'), 0);
  assert.equal(feedbackDurationForTone('warning'), 7_000);
  assert.equal(feedbackDurationForTone('success'), 4_500);

  const item = createFeedbackItem({
    title: '  Post was not published  ',
    description: '  Your draft is still available.  ',
    tone: 'critical',
  }, { id: 'notice-1', now: 100 });

  assert.deepEqual(item, {
    id: 'notice-1',
    title: 'Post was not published',
    description: 'Your draft is still available.',
    tone: 'critical',
    durationMs: 0,
    dedupeKey: null,
    count: 1,
    createdAt: 100,
    action: null,
  });
});

test('feedback queue deduplicates an active problem and records repeated occurrences', () => {
  const first = createFeedbackItem({
    title: 'Connection interrupted',
    tone: 'warning',
    dedupeKey: 'network:create-post',
  }, { id: 'first', now: 100 });
  const repeated = createFeedbackItem({
    title: 'Connection interrupted',
    description: 'Your draft is still available.',
    tone: 'warning',
    dedupeKey: 'network:create-post',
  }, { id: 'second', now: 200 });

  const queue = enqueueFeedbackItem([first], repeated, 4);

  assert.equal(queue.length, 1);
  assert.equal(queue[0]?.id, 'first');
  assert.equal(queue[0]?.count, 2);
  assert.equal(queue[0]?.createdAt, 200);
  assert.equal(queue[0]?.description, 'Your draft is still available.');
});

test('feedback queue keeps the newest notices and evicts a non-critical notice first', () => {
  const queue = [
    createFeedbackItem({ title: 'Security issue', tone: 'critical' }, { id: 'critical', now: 1 }),
    createFeedbackItem({ title: 'First confirmation', tone: 'success' }, { id: 'success-1', now: 2 }),
    createFeedbackItem({ title: 'Second confirmation', tone: 'success' }, { id: 'success-2', now: 3 }),
  ];
  const next = createFeedbackItem({ title: 'New warning', tone: 'warning' }, { id: 'warning', now: 4 });

  const result = enqueueFeedbackItem(queue, next, 3);

  assert.deepEqual(result.map((item) => item.id), ['critical', 'success-2', 'warning']);
});

test('dismiss removes only the requested feedback item', () => {
  const queue = [
    createFeedbackItem({ title: 'One' }, { id: 'one', now: 1 }),
    createFeedbackItem({ title: 'Two' }, { id: 'two', now: 2 }),
  ];

  assert.deepEqual(
    dismissFeedbackItem(queue, 'one').map((item) => item.id),
    ['two'],
  );
  assert.equal(dismissFeedbackItem(queue, 'missing'), queue);
});

test('feedback rejects an empty title instead of rendering an inaccessible blank notice', () => {
  assert.throws(
    () => createFeedbackItem({ title: '   ' }, { id: 'notice', now: 1 }),
    /title must not be empty/i,
  );
});

test('feedback validates identity, timestamp, and explicit duration contracts', () => {
  assert.throws(
    () => createFeedbackItem({ title: 'Notice' }, { id: '   ', now: 1 }),
    /ID must not be empty/i,
  );
  assert.throws(
    () => createFeedbackItem({ title: 'Notice' }, { id: 'notice', now: Number.NaN }),
    /timestamp must be finite/i,
  );
  assert.throws(
    () => createFeedbackItem({ title: 'Notice', durationMs: -1 }, { id: 'notice', now: 1 }),
    /duration must be a finite non-negative number/i,
  );

  const rounded = createFeedbackItem({ title: 'Notice', durationMs: 1250.6 }, { id: 'notice', now: 1 });
  assert.equal(rounded.durationMs, 1_251);
});

test('feedback rejects invalid runtime tone, action, duration, and queue limits', () => {
  assert.throws(
    () => createFeedbackItem({ title: 'Notice', tone: 'fatal' as never }, { id: 'notice', now: 1 }),
    /tone is not supported/i,
  );
  assert.throws(
    () => createFeedbackItem({ title: 'Notice', durationMs: 60_001 }, { id: 'notice', now: 1 }),
    /duration must not exceed/i,
  );
  assert.throws(
    () => createFeedbackItem({
      title: 'Notice',
      action: { label: '   ', onSelect() {} },
    }, { id: 'notice', now: 1 }),
    /action label must not be empty/i,
  );
  assert.throws(
    () => createFeedbackItem({
      title: 'Notice',
      action: { label: 'Retry', onSelect: null as never },
    }, { id: 'notice', now: 1 }),
    /action callback must be a function/i,
  );

  const action = () => undefined;
  const item = createFeedbackItem({
    title: 'Notice',
    action: { label: '  Retry  ', onSelect: action },
  }, { id: 'notice', now: 1 });
  assert.deepEqual(item.action, { label: 'Retry', onSelect: action });

  assert.throws(
    () => enqueueFeedbackItem([], item, Number.NaN),
    /maximum visible count must be finite/i,
  );
});
