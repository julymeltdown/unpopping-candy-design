import assert from 'node:assert/strict';
import test from 'node:test';
import { storyId, inspectStorySource } from '../../scripts/lib/story-contract.mjs';

test('Storybook ids are derived deterministically from title and named export', () => {
  assert.equal(storyId('Catalog/UI/TextField', 'Contract'), 'catalog-ui-textfield--contract');
  assert.equal(storyId('Catalog/Social/PostCard', 'WithRepost'), 'catalog-social-postcard--withrepost');
});

test('story source inspection finds one title and all named story exports', () => {
  const inspected = inspectStorySource(`
    const meta = { title: 'Catalog/UI/Button', component: Button } satisfies Meta<typeof Button>;
    export default meta;
    export const Contract: Story = {};
    export const PendingState: Story = {};
  `);
  assert.equal(inspected.title, 'Catalog/UI/Button');
  assert.deepEqual(inspected.exports, ['Contract', 'PendingState']);
  assert.deepEqual(inspected.ids, ['catalog-ui-button--contract', 'catalog-ui-button--pendingstate']);
});

test('story source inspection rejects missing or ambiguous titles', () => {
  assert.throws(() => inspectStorySource('export const Contract = {};'), /title/i);
  assert.throws(() => inspectStorySource("const a={title:'A/One'};const b={title:'B/Two'};export const Contract={};"), /exactly one/i);
});
