import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/restructuring/',
  plugins: [react()],

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
