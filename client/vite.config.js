import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'mat.apexitworld.com',
      'roles-importantly-restored-filter.trycloudflare.com',
      'shudder-properly-alias.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:7000',
        changeOrigin: true
      }
    }
  }
})
