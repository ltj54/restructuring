import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/restructuring/',   // 👈 VIKTIG for GitHub Pages
  server: {
    port: 5173,
    strictPort: true
  }
})
