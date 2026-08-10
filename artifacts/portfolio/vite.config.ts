import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Suppress warnings for chunks up to 700kb (icons lib is large)
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Split vendor code into separate cacheable chunks
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'
          }
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('lucide-react') || id.includes('react-icons')) return 'icons'
          if (id.includes('@radix-ui')) return 'radix'
          if (id.includes('@tanstack')) return 'query'
        },
      },
    },
    // Sourcemaps only in dev (smaller prod bundle, source not exposed)
    sourcemap: mode === 'development',
    // Minify with esbuild (faster than terser, good enough for production)
    minify: 'esbuild',
    target: 'es2020',
  },
  // Pre-bundle these for faster dev server cold start
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', '@tanstack/react-query'],
  },
}))
