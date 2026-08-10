import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type ProjectCategory = 'Graphics' | 'Product Design'

export function useListProjects(params?: { category?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    let cancelled = false

    const fetchProjects = async () => {
      try {
        // FIX: On first render with no filter, consume the prefetch that was
        // started in main.tsx — avoids a duplicate round-trip to Supabase.
        const prefetch = (window as any).__projectsPrefetch
        let result

        if (!params?.category && prefetch) {
          result = await prefetch
          delete (window as any).__projectsPrefetch // consume once
        } else {
          let query = supabase.from('projects').select('*')
          if (params?.category && params.category !== 'All') {
            query = query.eq('category', params.category)
          }
          result = await query.order('id', { ascending: false })
        }

        if (!cancelled) {
          setData(result.data ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch projects:', err)
          setData([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchProjects()
    return () => { cancelled = true }
  }, [params?.category])

  return { data, isLoading }
}
