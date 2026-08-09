import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const root = resolve(import.meta.dirname, '../..');
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@commonspace/eval-report': resolve(root, 'agent/manifests/evals.json'),
      '@commonspace/tokens/styles.css': resolve(root, 'packages/tokens/src/styles.css'),
      '@commonspace/ui/styles.css': resolve(root, 'packages/ui/src/styles.css'),
      '@commonspace/tokens': resolve(root, 'packages/tokens/src/index.ts'),
      '@commonspace/theme': resolve(root, 'packages/theme/src/index.ts'),
      '@commonspace/ui': resolve(root, 'packages/ui/src/index.ts'),
    },
  },
  server: { fs: { allow: [root] } },
});
