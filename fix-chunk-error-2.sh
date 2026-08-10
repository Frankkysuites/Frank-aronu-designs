#!/usr/bin/env bash
# =============================================================================
# Fix: "Cannot access 'c' before initialization" — still circular deps
# Solution: remove ALL manualChunks, let Vite handle splitting automatically.
# Run from repo root: bash fix-chunk-error-2.sh
# =============================================================================

set -e

echo ""
echo "▶  Removing all manual chunk splitting …"

cat > "artifacts/portfolio/vite.config.ts" << 'EOF'
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
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    // No manualChunks at all — Vite's automatic splitting avoids
    // the circular reference ReferenceError completely.
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', '@tanstack/react-query'],
  },
}))
EOF

echo "   ✅  vite.config.ts: all manualChunks removed"
echo ""
echo "▶  Committing and pushing …"
git add -A
git commit -m "fix: remove all manualChunks to eliminate circular dep ReferenceError"
git push

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Done ✅ — Vercel will redeploy in ~1 min               ║"
echo "╚══════════════════════════════════════════════════════════╝"
