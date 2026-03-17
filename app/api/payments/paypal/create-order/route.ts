import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createPayPalOrder } from '@/lib/paypal'

// Approximate ARS to USD rate — update this or fetch dynamically
const ARS_TO_USD = 0.001

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId } = await request.json()

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, price, currency')
    .eq('id', courseId)
    .single()

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  // Check for existing completed purchase
  const { data: existingPurchase } = await supabase
    .from('purchases')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existingPurchase?.status === 'completed' || existingPurchase?.status === 'manual') {
    return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
  }

  const adminClient = await createAdminClient()
  let purchaseId: string

  // Convert price to USD if needed
  const amountUsd = course.currency === 'ARS' ? course.price * ARS_TO_USD : course.price

  if (existingPurchase) {
    purchaseId = existingPurchase.id
  } else {
    const { data: newPurchase, error: purchaseError } = await adminClient
      .from('purchases')
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: 'pending',
        provider: 'paypal',
        amount: amountUsd,
        currency: 'USD',
      })
      .select('id')
      .single()

    if (purchaseError || !newPurchase) {
      return NextResponse.json({ error: 'Could not create purchase record' }, { status: 500 })
    }

    purchaseId = newPurchase.id
  }

  const order = await createPayPalOrder({ amountUsd, purchaseId })

  return NextResponse.json({ orderId: order.id })
}
