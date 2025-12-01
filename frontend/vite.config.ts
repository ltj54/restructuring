import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load correct env file (.env.production, .env.development, etc.)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_PUBLIC_BASE || '/',
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
  };
});
