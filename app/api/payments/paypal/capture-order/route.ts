import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { capturePayPalOrder } from '@/lib/paypal'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId } = await request.json()

  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
  }

  const captureResult = await capturePayPalOrder(orderId)

  if (captureResult.status !== 'COMPLETED') {
    return NextResponse.json(
      { error: 'Payment not completed', status: captureResult.status },
      { status: 400 }
    )
  }

  // The purchase_units reference_id is our purchaseId
  const purchaseId = captureResult.purchase_units?.[0]?.reference_id

  if (!purchaseId) {
    return NextResponse.json({ error: 'No reference_id in capture result' }, { status: 400 })
  }

  const adminClient = await createAdminClient()
  const { error } = await adminClient
    .from('purchases')
    .update({
      status: 'completed',
      provider_ref: orderId,
      granted_at: new Date().toISOString(),
    })
    .eq('id', purchaseId)
    .eq('user_id', user.id)

  if (error) {
    console.error('PayPal capture DB error:', error)
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
