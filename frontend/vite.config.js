import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/k2api': {
        target: 'https://api.k2think.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/k2api/, ''),
      },
    },
  },
})
