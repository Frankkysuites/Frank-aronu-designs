import { useState, useEffect } from 'react'
type ToastItem = { id: number; title?: string; description?: string; variant?: 'default' | 'destructive' }
let _id = 0
const _listeners: Array<(t: ToastItem[]) => void> = []
let _toasts: ToastItem[] = []
function _notify() { _listeners.forEach(fn => fn(_toasts)) }
export function toast(props: Omit<ToastItem, 'id'>) {
  const id = _id++
  _toasts = [..._toasts, { id, ...props }]
  _notify()
  setTimeout(() => { _toasts = _toasts.filter(t => t.id !== id); _notify() }, 3000)
}
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])
  useEffect(() => {
    const fn = (next: ToastItem[]) => setItems([...next])
    _listeners.push(fn)
    return () => { const i = _listeners.indexOf(fn); if (i > -1) _listeners.splice(i, 1) }
  }, [])
  if (!items.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {items.map(item => (
        <div key={item.id} className={`p-4 rounded-lg shadow-lg min-w-[300px] ${item.variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}>
          {item.title && <div className="font-semibold">{item.title}</div>}
          {item.description && <div className="text-sm mt-1">{item.description}</div>}
        </div>
      ))}
    </div>
  )
}
