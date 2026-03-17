import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // In dev, allow forcing a provider via env var
  if (process.env.NODE_ENV === 'development') {
    const devProvider = process.env.NEXT_PUBLIC_DEV_PAYMENT_PROVIDER
    if (devProvider === 'mp') {
      return NextResponse.json({ country: 'AR', isArgentina: true })
    }
    if (devProvider === 'paypal') {
      return NextResponse.json({ country: 'US', isArgentina: false })
    }
  }

  const country = request.headers.get('x-vercel-ip-country') ?? 'unknown'
  return NextResponse.json({ country, isArgentina: country === 'AR' })
}
