'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

async function fetchPurchase(courseId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('purchases')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .in('status', ['completed', 'manual'])
    .maybeSingle()

  return data
}

export function usePurchase(courseId: string | null) {
  const { data, isLoading, mutate } = useSWR(
    courseId ? `purchase-${courseId}` : null,
    () => fetchPurchase(courseId!)
  )

  return {
    purchase: data ?? null,
    hasPurchased: !!data,
    isLoading,
    mutate,
  }
}
