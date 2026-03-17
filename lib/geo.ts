import { NextRequest } from 'next/server'

export function getCountryFromRequest(request: NextRequest): string {
  const country = request.headers.get('x-vercel-ip-country') ?? 'unknown'
  return country
}

export function isArgentinaRequest(request: NextRequest): boolean {
  return getCountryFromRequest(request) === 'AR'
}
