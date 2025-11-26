import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],

  base: '/restructuring/',

  server: {
    port: 5173,
    strictPort: true,
  },

  test: {
    environment: 'node',
    setupFiles: ['src/test/setup.ts'],
    globals: true,
  },
});
