import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Only use proxy in development if VITE_API_URL is not set
    // If VITE_API_URL is set, use it directly (no proxy needed)
    proxy: !process.env.VITE_API_URL ? {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    } : undefined
  }
})
