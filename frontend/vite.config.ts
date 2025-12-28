import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const rootDir = fileURLToPath(new URL('.', import.meta.url));
  const env = loadEnv(mode, rootDir, '');

  const isDev = mode === 'development';

  return {
    root: rootDir,
    envDir: rootDir,
    // 🔥 KRITISK: riktig base-path for GitHub Pages
    base: isDev ? '/' : '/restructuring/',

    plugins: [react()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  };
});


