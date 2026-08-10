import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const PROFILE_CACHE_KEY = 'fa_profile_cache'
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes (profile changes rarely)

const DEFAULT_PROFILE = {
  name: 'Frank Aronu',
  title: 'Graphics & Product Designer',
  location: 'Nigeria',
  email: 'hello.frankaronu.designs@gmail.com',
  bio: 'Multidisciplinary designer focused on crafting precise, engaging digital experiences.',
  imageUrl: '',
  social: {
    dribbble: '',
    behance: '',
    linkedin: '',
    instagram: '',
    whatsapp: '',
  },
}

function readProfileCache() {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

function mapProfile(row: any) {
  return {
    name: row.name ?? DEFAULT_PROFILE.name,
    title: row.title ?? DEFAULT_PROFILE.title,
    location: row.location ?? DEFAULT_PROFILE.location,
    email: row.email ?? DEFAULT_PROFILE.email,
    bio: row.bio ?? DEFAULT_PROFILE.bio,
    imageUrl: row.image_url ?? '',
    social: {
      dribbble:  row.social?.dribbble  ?? '',
      behance:   row.social?.behance   ?? '',
      linkedin:  row.social?.linkedin  ?? '',
      instagram: row.social?.instagram ?? '',
      whatsapp:  row.social?.whatsapp  ?? '',
    },
  }
}

export function useProfile() {
  const cached = readProfileCache()
  const [profile, setProfile] = useState(cached ?? DEFAULT_PROFILE)
  const [isLoading, setIsLoading] = useState(!cached)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .eq('id', 1)
          .single()
        if (error) throw error
        if (!cancelled && data) {
          const mapped = mapProfile(data)
          setProfile(mapped)
          localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify({ data: mapped, ts: Date.now() }))
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return { profile, isLoading }
}
