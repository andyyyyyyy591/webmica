'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Spinner } from '@/components/ui/spinner'
import { CardBrandIcons } from './CardBrandIcons'
import { useGeo } from '@/hooks/useGeo'
import { formatPrice } from '@/lib/utils'
import type { Course } from '@/types/database'

// Dynamic imports to avoid SSR issues with payment SDKs
const MercadoPagoForm = dynamic(
  () => import('./MercadoPagoForm').then((m) => ({ default: m.MercadoPagoForm })),
  { ssr: false, loading: () => <div className="py-8 flex justify-center"><Spinner /></div> }
)

const PayPalForm = dynamic(
  () => import('./PayPalForm').then((m) => ({ default: m.PayPalForm })),
  { ssr: false, loading: () => <div className="py-8 flex justify-center"><Spinner /></div> }
)

interface PaymentModalProps {
  course: Pick<Course, 'id' | 'title' | 'price' | 'currency'>
  open: boolean
  onClose: () => void
}

export function PaymentModal({ course, open, onClose }: PaymentModalProps) {
  const router = useRouter()
  const { isArgentina, isLoading: geoLoading } = useGeo()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleSuccess() {
    setStatus('success')
    setTimeout(() => {
      onClose()
      router.push('/dashboard')
      router.refresh()
    }, 2000)
  }

  function handleError(msg: string) {
    setStatus('error')
    setErrorMsg(msg)
  }

  return (
    <Modal open={open} onClose={onClose} className="max-w-lg">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Completar compra</h2>
          <p className="text-sm text-gray-500 mt-1">
            {course.title} —{' '}
            <span className="font-semibold text-gray-900">{formatPrice(course.price, course.currency)}</span>
          </p>
        </div>

        {status === 'success' ? (
          <div className="rounded-lg bg-green-50 p-6 text-center">
            <div className="text-4xl mb-2">✓</div>
            <p className="font-semibold text-green-800">¡Pago exitoso!</p>
            <p className="text-sm text-green-600 mt-1">Redirigiendo a tu dashboard...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Tarjetas aceptadas</p>
              <CardBrandIcons />
            </div>

            <div className="border-t pt-4">
              {geoLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : isArgentina ? (
                <MercadoPagoForm
                  courseId={course.id}
                  coursePrice={course.price}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              ) : (
                <PayPalForm
                  courseId={course.id}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              )}
            </div>

            {status === 'error' && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{errorMsg}</p>
            )}

            <p className="text-center text-xs text-gray-400">
              Pago seguro y encriptado
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}
