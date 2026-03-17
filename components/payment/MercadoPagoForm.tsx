'use client'

import { useEffect, useState } from 'react'
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react'
import { Spinner } from '@/components/ui/spinner'

interface MercadoPagoFormProps {
  courseId: string
  coursePrice: number
  onSuccess: () => void
  onError: (msg: string) => void
}

export function MercadoPagoForm({ courseId, coursePrice, onSuccess, onError }: MercadoPagoFormProps) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: 'es-AR' })

    async function loadPreference() {
      try {
        const res = await fetch('/api/payments/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Error al iniciar el pago')
        setPreferenceId(data.preferenceId)
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Error al iniciar el pago')
      } finally {
        setLoading(false)
      }
    }

    loadPreference()
  }, [courseId, onError])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (!preferenceId) return null

  return (
    <CardPayment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialization={{ amount: coursePrice, preferenceId } as any}
      customization={{
        visual: {
          style: { theme: 'flat' },
          hidePaymentButton: false,
          hideFormTitle: true,
        },
        paymentMethods: {
          minInstallments: 1,
          maxInstallments: 1,
        },
      }}
      onSubmit={async (formData) => {
        // The brick processes the payment; success is confirmed via webhook
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((formData as any).status === 'approved') {
          onSuccess()
        }
      }}
      onError={(error) => {
        console.error('MP error:', error)
        onError('Error al procesar el pago. Intenta nuevamente.')
      }}
    />
  )
}
