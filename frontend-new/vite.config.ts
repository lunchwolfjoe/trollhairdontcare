import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
    minify: mode === 'production',
    sourcemap: mode !== 'production',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      onwarn(warning, warn) {
        // Ignore all TypeScript errors during build
        if (warning.code === 'TYPESCRIPT_ERROR' || warning.code === 'PLUGIN_WARNING') return;
        warn(warning);
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  esbuild: {
    // Skip type checking in production mode
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Drop console logs and debugger statements in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
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
}))


