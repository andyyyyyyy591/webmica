'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import type { Profile } from '@/types/database'

interface UserTableProps {
  users: Profile[]
}

export function UserTable({ users: initial }: UserTableProps) {
  const [users, setUsers] = useState(initial)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  const filtered = search
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.full_name ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : users

  async function toggleRole(user: Profile) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`¿Cambiar rol de ${user.email} a ${newRole}?`)) return
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id)
    if (!error) {
      setUsers(users.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)))
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email o nombre..."
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Registro</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Sin resultados.</td>
              </tr>
            )}
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{user.full_name || '—'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(user.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleRole(user)}
                    className="text-xs font-medium text-violet-600 hover:underline"
                  >
                    Cambiar a {user.role === 'admin' ? 'user' : 'admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
