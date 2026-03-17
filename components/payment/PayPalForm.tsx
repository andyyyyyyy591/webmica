'use client'

import {
  PayPalScriptProvider,
  PayPalCardFieldsProvider,
  PayPalCardFieldsForm,
  usePayPalCardFields,
} from '@paypal/react-paypal-js'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface PayPalFormProps {
  courseId: string
  onSuccess: () => void
  onError: (msg: string) => void
}

function SubmitButton({ onError }: { onError: (msg: string) => void }) {
  const { cardFieldsForm } = usePayPalCardFields()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!cardFieldsForm) return
    setLoading(true)
    try {
      await cardFieldsForm.submit()
    } catch {
      onError('Error al procesar el pago. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSubmit}
      loading={loading}
      size="lg"
      className="mt-4 w-full"
    >
      Pagar ahora
    </Button>
  )
}

export function PayPalForm({ courseId, onSuccess, onError }: PayPalFormProps) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        components: 'card-fields',
      }}
    >
      <PayPalCardFieldsProvider
        createOrder={async () => {
          const res = await fetch('/api/payments/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Error al iniciar el pago')
          return data.orderId
        }}
        onApprove={async (data) => {
          const res = await fetch('/api/payments/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderID }),
          })
          const result = await res.json()
          if (!res.ok) {
            onError(result.error || 'Error al confirmar el pago')
            return
          }
          onSuccess()
        }}
        onError={() => {
          onError('Error al procesar el pago. Intenta nuevamente.')
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style={{ variables: { 'font-family': 'inherit', colorText: '#111827' } } as any}
      >
        <div className="space-y-3">
          <PayPalCardFieldsForm />
        </div>
        <SubmitButton onError={onError} />
      </PayPalCardFieldsProvider>
    </PayPalScriptProvider>
  )
}
