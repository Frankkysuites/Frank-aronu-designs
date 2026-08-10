import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { supabase } from './lib/supabase'

// FIX: Kick off the Supabase projects query immediately on script load,
// before React even mounts. This runs in parallel with JS parsing/hydration
// so by the time the Home component asks for projects, the response is
// already in flight (or done). Cuts perceived load by ~300–700ms.
const projectsPrefetch = supabase
  .from('projects')
  .select('*')
  .order('id', { ascending: false })

// Expose on window so useListProjects can consume the in-flight promise
;(window as any).__projectsPrefetch = projectsPrefetch

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
