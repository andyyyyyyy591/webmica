const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const secret = process.env.PAYPAL_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64')

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await response.json()
  return data.access_token
}

export async function createPayPalOrder({
  amountUsd,
  purchaseId,
}: {
  amountUsd: number
  purchaseId: string
}) {
  const accessToken = await getAccessToken()

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: purchaseId,
          amount: {
            currency_code: 'USD',
            value: amountUsd.toFixed(2),
          },
        },
      ],
      payment_source: { card: {} },
    }),
  })

  return response.json()
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getAccessToken()

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  return response.json()
}

export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: string,
  webhookId: string
) {
  const accessToken = await getAccessToken()

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        client_id: process.env.PAYPAL_CLIENT_ID,
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    }
  )

  const data = await response.json()
  return data.verification_status === 'SUCCESS'
}
