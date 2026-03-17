import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getPaymentById } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  const body = await request.json()

  // MP sends type=payment notifications
  if (body.type !== 'payment' || !body.data?.id) {
    return NextResponse.json({ received: true })
  }

  const paymentId = String(body.data.id)

  try {
    const payment = await getPaymentById(paymentId)

    if (payment.status !== 'approved') {
      return NextResponse.json({ received: true })
    }

    const purchaseId = payment.external_reference
    if (!purchaseId) {
      return NextResponse.json({ error: 'No external_reference' }, { status: 400 })
    }

    const adminClient = await createAdminClient()
    const { error } = await adminClient
      .from('purchases')
      .update({
        status: 'completed',
        provider_ref: paymentId,
        granted_at: new Date().toISOString(),
      })
      .eq('id', purchaseId)
      .eq('status', 'pending')

    if (error) {
      console.error('Webhook update error:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
