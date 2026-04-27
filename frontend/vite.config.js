import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_TARGET = 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth':      { target: API_TARGET, changeOrigin: true },
      '/users':     { target: API_TARGET, changeOrigin: true },
      '/projects':  { target: API_TARGET, changeOrigin: true },
      '/community': { target: API_TARGET, changeOrigin: true },
      '/tasks':     { target: API_TARGET, changeOrigin: true },
      '/analytics': { target: API_TARGET, changeOrigin: true },
    }
  }
})
