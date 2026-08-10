import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type ProjectCategory = 'Graphics' | 'Product Design'

const CACHE_KEY = 'fa_projects_cache'
const CACHE_TTL = 1000 * 60 * 10 // 10 minutes

function readCache(category?: string) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${category ?? 'all'}`)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function writeCache(category: string | undefined, data: any[]) {
  try {
    localStorage.setItem(
      `${CACHE_KEY}_${category ?? 'all'}`,
      JSON.stringify({ data, ts: Date.now() })
    )
  } catch {}
}

export function useListProjects(params?: { category?: string }) {
  const category = params?.category

  // Seed state from cache immediately — zero loading flash on repeat visits
  const [data, setData] = useState<any[]>(() => readCache(category) ?? [])
  const [isLoading, setIsLoading] = useState(() => !readCache(category))

  useEffect(() => {
    let cancelled = false
    const cached = readCache(category)

    // Show cached data instantly, then revalidate silently in background
    if (cached) {
      setData(cached)
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }

    const fetchFresh = async () => {
      try {
        // Consume the prefetch from main.tsx on first unfiltered load
        const prefetch = (window as any).__projectsPrefetch
        let result

        if (!category && prefetch) {
          result = await prefetch
          delete (window as any).__projectsPrefetch
        } else {
          // FIX: only select columns the UI actually uses — smaller payload
          let query = supabase
            .from('projects')
            .select('id, title, slug, category, description, image_url')
          if (category && category !== 'All') {
            query = query.eq('category', category)
          }
          result = await query.order('id', { ascending: false })
        }

        if (!cancelled && result.data) {
          setData(result.data)
          writeCache(category, result.data)
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchFresh()
    return () => { cancelled = true }
  }, [category])

  return { data, isLoading }
}
