import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const root = resolve(import.meta.dirname, '../../..');
const aliases = {
  '@commonspace/tokens/styles.css': resolve(root, 'packages/tokens/src/styles.css'),
  '@commonspace/icons/styles.css': resolve(root, 'packages/icons/src/styles.css'),
  '@commonspace/ui/styles.css': resolve(root, 'packages/ui/src/styles.css'),
  '@commonspace/social/styles.css': resolve(root, 'packages/social/src/styles.css'),
  '@commonspace/tokens': resolve(root, 'packages/tokens/src/index.ts'),
  '@commonspace/theme': resolve(root, 'packages/theme/src/index.ts'),
  '@commonspace/icons': resolve(root, 'packages/icons/src/index.ts'),
  '@commonspace/ui': resolve(root, 'packages/ui/src/index.ts'),
  '@commonspace/social': resolve(root, 'packages/social/src/index.ts'),
};

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { autodocs: 'tag' },
  async viteFinal(config) {
    return mergeConfig(config, { resolve: { alias: aliases } });
  },
};
export default config;
