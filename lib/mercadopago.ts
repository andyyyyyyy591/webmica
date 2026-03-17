import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

export function getMercadoPagoClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  })
}

export async function createPreference({
  courseTitle,
  price,
  purchaseId,
}: {
  courseTitle: string
  price: number
  purchaseId: string
}) {
  const client = getMercadoPagoClient()
  const preference = new Preference(client)

  const result = await preference.create({
    body: {
      items: [
        {
          id: purchaseId,
          title: courseTitle,
          quantity: 1,
          unit_price: price,
          currency_id: 'ARS',
        },
      ],
      external_reference: purchaseId,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/mercadopago/webhook`,
    },
  })

  return result
}

export async function getPaymentById(paymentId: string) {
  const client = getMercadoPagoClient()
  const payment = new Payment(client)
  return payment.get({ id: paymentId })
}
