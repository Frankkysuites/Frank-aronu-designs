import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { supabase } from './lib/supabase'

// Kick off both queries before React mounts — runs in parallel with JS parsing.
// By the time Home/ProjectDetail components ask for data, responses are already
// in flight. Cuts perceived load by ~300–700ms on cold Supabase starts.
;(window as any).__projectsPrefetch = supabase
  .from('projects')
  .select('id, title, slug, category, description, image_url')
  .order('id', { ascending: false })

;(window as any).__profilePrefetch = supabase
  .from('profile')
  .select('*')
  .eq('id', 1)
  .single()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
