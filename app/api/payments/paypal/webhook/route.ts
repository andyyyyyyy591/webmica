import { NextRequest, NextResponse } from 'next/server'

// PayPal webhooks are handled via capture-order for Advanced Card Fields.
// This endpoint is a placeholder for additional webhook events (refunds, disputes).
export async function POST(request: NextRequest) {
  const body = await request.text()
  const event = JSON.parse(body)

  console.log('PayPal webhook event:', event.event_type)

  // TODO: handle PAYMENT.CAPTURE.REFUNDED, PAYMENT.CAPTURE.DENIED etc.

  return NextResponse.json({ received: true })
}
