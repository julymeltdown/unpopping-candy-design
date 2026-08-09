import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const root = resolve(import.meta.dirname, '../../..');
const aliases = {
  '@unpopping-candy/tokens/styles.css': resolve(root, 'packages/tokens/src/styles.css'),
  '@unpopping-candy/icons/styles.css': resolve(root, 'packages/icons/src/styles.css'),
  '@unpopping-candy/ui/styles.css': resolve(root, 'packages/ui/src/styles.css'),
  '@unpopping-candy/social/styles.css': resolve(root, 'packages/social/src/styles.css'),
  '@unpopping-candy/tokens': resolve(root, 'packages/tokens/src/index.ts'),
  '@unpopping-candy/theme': resolve(root, 'packages/theme/src/index.ts'),
  '@unpopping-candy/icons': resolve(root, 'packages/icons/src/index.ts'),
  '@unpopping-candy/ui': resolve(root, 'packages/ui/src/index.ts'),
  '@unpopping-candy/social': resolve(root, 'packages/social/src/index.ts'),
};

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
    { name: '@storybook/addon-mcp', options: { endpoint: '/mcp', toolsets: { dev: true, docs: true, test: true } } },
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  docs: { autodocs: 'tag' },
  features: { componentsManifest: true },
  async viteFinal(config) {
    return mergeConfig(config, { resolve: { alias: aliases } });
  },
};
export default config;
