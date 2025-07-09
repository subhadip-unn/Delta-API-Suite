import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src', // Simple alias that works without __dirname
    },
  },
  // Development server configuration with API proxy
  server: {
    proxy: {
      // Proxy all /api requests to the backend server
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Rewrite path if needed (uncomment if your backend doesn't expect /api prefix)
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
