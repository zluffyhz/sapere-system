import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react({
    jsxRuntime: 'automatic'
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    historyApiFallback: true,
  },
  preview: {
    port: 5173,
    host: true,
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1600,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react'],
          charts: ['recharts'],
          utils: ['date-fns', 'clsx']
        }
      }
    },
    assetsDir: 'assets',
    cssCodeSplit: true,
    emptyOutDir: true,
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  base: './'
})