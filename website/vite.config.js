import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    allowedHosts: [
      'shudder-properly-alias.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io'
    ]
  }
});
