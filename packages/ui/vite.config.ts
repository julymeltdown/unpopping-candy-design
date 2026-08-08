import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const entry = Object.fromEntries(
  ['index', 'alert', 'avatar', 'badge', 'button', 'dialog', 'feedback', 'forms', 'layout', 'loading', 'tabs']
    .map((name) => [name, resolve(import.meta.dirname, `src/${name}.ts`)]),
);

export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry, formats: ['es'] },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@commonspace/icons',
        '@commonspace/tokens',
      ],
      output: { entryFileNames: '[name].js', chunkFileNames: 'chunks/[name]-[hash].js' },
    },
    sourcemap: true,
    emptyOutDir: false,
  },
});
