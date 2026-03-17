'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

async function fetchUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as Profile | null
}

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR('user', fetchUser, {
    revalidateOnFocus: false,
  })

  return {
    user: data ?? null,
    isLoading,
    isError: !!error,
    isAdmin: data?.role === 'admin',
    mutate,
  }
}
