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
    sourcemap: mode === 'development',
    minify: 'esbuild',
    target: 'es2020',
    // FIX: remove function-based manualChunks — it caused circular reference
    // errors when chunks reference each other before initialization.
    // Vite's default chunking handles this safely on its own.
    rollupOptions: {
      output: {
        // Simple vendor split: just separate node_modules from app code.
        // This avoids the circular dep while still keeping vendor code cacheable.
        manualChunks: {
          vendor: ['react', 'react-dom', 'wouter'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', '@tanstack/react-query'],
  },
}))
