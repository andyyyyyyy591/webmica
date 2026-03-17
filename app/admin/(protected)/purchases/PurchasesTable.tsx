'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Purchase {
  id: string
  status: string
  provider: string | null
  amount: number | null
  currency: string | null
  created_at: string
  profiles: { email: string; full_name: string | null } | null
  courses: { title: string; slug: string } | null
  user_id: string
  course_id: string
}

interface PurchasesTableProps {
  purchases: Purchase[]
  allUsers: { id: string; email: string; full_name: string | null }[]
  allCourses: { id: string; title: string }[]
}

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  completed: 'success',
  manual: 'info',
  pending: 'warning',
  failed: 'danger',
  refunded: 'default',
}

export function PurchasesTable({ purchases, allUsers, allCourses }: PurchasesTableProps) {
  const router = useRouter()
  const [grantUserId, setGrantUserId] = useState('')
  const [grantCourseId, setGrantCourseId] = useState('')
  const [granting, setGranting] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = purchases.filter((p) => {
    const matchSearch =
      !search ||
      p.profiles?.email.toLowerCase().includes(search.toLowerCase()) ||
      p.courses?.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  async function handleGrant() {
    if (!grantUserId || !grantCourseId) return
    setGranting(true)
    await fetch('/api/admin/grant-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: grantUserId, courseId: grantCourseId }),
    })
    setGranting(false)
    setGrantUserId('')
    setGrantCourseId('')
    router.refresh()
  }

  async function handleRevoke(userId: string, courseId: string) {
    if (!confirm('¿Revocar acceso a este curso?')) return
    await fetch('/api/admin/revoke-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Manual grant */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Otorgar acceso manual</h2>
        <div className="flex flex-wrap gap-3">
          <select
            value={grantUserId}
            onChange={(e) => setGrantUserId(e.target.value)}
            className="flex-1 min-w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          >
            <option value="">Seleccionar usuario...</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name ? `${u.full_name} (${u.email})` : u.email}
              </option>
            ))}
          </select>
          <select
            value={grantCourseId}
            onChange={(e) => setGrantCourseId(e.target.value)}
            className="flex-1 min-w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
          >
            <option value="">Seleccionar curso...</option>
            {allCourses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <Button
            onClick={handleGrant}
            loading={granting}
            disabled={!grantUserId || !grantCourseId}
          >
            Otorgar acceso
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email o curso..."
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="completed">Completado</option>
          <option value="manual">Manual</option>
          <option value="pending">Pendiente</option>
          <option value="failed">Fallido</option>
          <option value="refunded">Reembolsado</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Comprador</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Curso</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Monto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Proveedor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Sin resultados.</td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{p.profiles?.full_name || '—'}</p>
                  <p className="text-xs text-gray-500">{p.profiles?.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{p.courses?.title || '—'}</td>
                <td className="px-4 py-3 text-gray-700">
                  {p.amount ? formatPrice(p.amount, p.currency ?? 'ARS') : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500">{p.provider || '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_COLORS[p.status] ?? 'default'}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(p.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3">
                  {(p.status === 'completed' || p.status === 'manual') && (
                    <button
                      onClick={() => handleRevoke(p.user_id, p.course_id)}
                      className="text-xs font-medium text-red-500 hover:underline"
                    >
                      Revocar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
