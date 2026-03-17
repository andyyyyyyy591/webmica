'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useGeo() {
  const { data, isLoading } = useSWR<{ country: string; isArgentina: boolean }>(
    '/api/geo',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 60, // 1 hour
    }
  )

  return {
    country: data?.country ?? null,
    isArgentina: data?.isArgentina ?? null,
    isLoading,
  }
}
