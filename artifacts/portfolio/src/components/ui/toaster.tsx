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
