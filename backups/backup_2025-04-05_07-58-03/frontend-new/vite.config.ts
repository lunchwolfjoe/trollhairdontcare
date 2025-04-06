import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5177,  // Updated port to avoid conflicts
    host: true,
    strictPort: false, // Allow using a different port if 5177 is taken
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
})


