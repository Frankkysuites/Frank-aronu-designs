// Simple toast implementation
import { useState, useEffect } from 'react'

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

let toastId = 0
const listeners: Array<(toasts: any[]) => void> = []
let toasts: any[] = []

function notify() {
  listeners.forEach(listener => listener(toasts))
}

export function toast({ title, description, variant = 'default' }: ToastProps) {
  const id = toastId++
  const newToast = { id, title, description, variant }
  toasts = [...toasts, newToast]
  notify()
  
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    notify()
  }, 3000)
  
  return id
}

export function Toaster() {
  const [state, setState] = useState<any[]>([])
  
  useEffect(() => {
    const listener = (newToasts: any[]) => setState([...newToasts])
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])
  
  if (state.length === 0) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {state.map(toast => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg min-w-[300px] ${
            toast.variant === 'destructive' 
              ? 'bg-red-500 text-white' 
              : 'bg-gray-800 text-white'
          }`}
        >
          {toast.title && <div className="font-semibold">{toast.title}</div>}
          {toast.description && <div className="text-sm mt-1">{toast.description}</div>}
        </div>
      ))}
    </div>
  )
}
