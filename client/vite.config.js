import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the React app runs on http://localhost:5173
// and every /api request is forwarded to the Express server on port 3000.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
