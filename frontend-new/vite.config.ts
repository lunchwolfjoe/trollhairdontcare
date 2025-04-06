import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    dedupe: ['leaflet', 'react-leaflet']
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      onwarn(warning, warn) {
        if (warning.code === 'TYPESCRIPT_ERROR') return;
        warn(warning);
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      '@mui/material', 
      '@mui/icons-material',
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    }
  },
})


