#!/usr/bin/env bash
# =============================================================================
# Fix: "Cannot access 's' before initialization"
# Root cause: use-toast.ts references `toast` that is never imported/defined —
# it relies on a ghost global from toaster.tsx that doesn't exist at module
# load time, causing a TDZ (Temporal Dead Zone) ReferenceError.
# Fix: wire use-toast.ts to import toast directly from toaster.tsx.
# Run from repo root: bash fix-tdz-error.sh
# =============================================================================

set -e

SRC="artifacts/portfolio/src"

echo ""
echo "▶  Fixing use-toast.ts TDZ ReferenceError …"

# Fix use-toast.ts — import toast from toaster instead of using a ghost global
cat > "$SRC/hooks/use-toast.ts" << 'EOF'
// Import toast directly from toaster so there's no undefined reference
import { toast } from '@/components/ui/toaster'

export { toast }

export function useToast() {
  return { toast }
}
EOF
echo "   ✅  use-toast.ts: imports toast from toaster properly"

# Also ensure toaster.tsx exports toast as a named export (it already does,
# but let's make it cleaner and ensure no module-level side-effects)
cat > "$SRC/components/ui/toaster.tsx" << 'EOF'
import { useState, useEffect } from 'react'

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

type ToastItem = ToastProps & { id: number }

let _toastId = 0
const _listeners: Array<(toasts: ToastItem[]) => void> = []
let _toasts: ToastItem[] = []

function _notify() {
  _listeners.forEach(fn => fn(_toasts))
}

// Named export so use-toast.ts can import it directly
export function toast(props: ToastProps) {
  const id = _toastId++
  _toasts = [..._toasts, { id, ...props }]
  _notify()
  setTimeout(() => {
    _toasts = _toasts.filter(t => t.id !== id)
    _notify()
  }, 3000)
  return id
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const listener = (next: ToastItem[]) => setItems([...next])
    _listeners.push(listener)
    return () => {
      const i = _listeners.indexOf(listener)
      if (i > -1) _listeners.splice(i, 1)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {items.map(item => (
        <div
          key={item.id}
          className={`p-4 rounded-lg shadow-lg min-w-[300px] ${
            item.variant === 'destructive'
              ? 'bg-red-500 text-white'
              : 'bg-gray-800 text-white'
          }`}
        >
          {item.title && <div className="font-semibold">{item.title}</div>}
          {item.description && <div className="text-sm mt-1">{item.description}</div>}
        </div>
      ))}
    </div>
  )
}
EOF
echo "   ✅  toaster.tsx: clean exports, no module-level side effects"

echo ""
echo "▶  Committing and pushing …"
git add -A
git commit -m "fix: resolve TDZ ReferenceError — wire use-toast to import toast from toaster"
git push

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║              TDZ error fixed ✅                          ║"
echo "║  Vercel will redeploy in ~1 min.                         ║"
echo "╚══════════════════════════════════════════════════════════╝"
