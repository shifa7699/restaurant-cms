import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/add-menu': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/update-menu': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/delete-menu': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
