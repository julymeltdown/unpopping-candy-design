import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const root = resolve(import.meta.dirname, '../..');
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@unpopping-candy/eval-report': resolve(root, 'agent/manifests/evals.json'),
      '@unpopping-candy/tokens/styles.css': resolve(root, 'packages/tokens/src/styles.css'),
      '@unpopping-candy/ui/styles.css': resolve(root, 'packages/ui/src/styles.css'),
      '@unpopping-candy/tokens': resolve(root, 'packages/tokens/src/index.ts'),
      '@unpopping-candy/theme': resolve(root, 'packages/theme/src/index.ts'),
      '@unpopping-candy/ui': resolve(root, 'packages/ui/src/index.ts'),
    },
  },
  server: { fs: { allow: [root] } },
});
