'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchKeys?: (keyof T)[]
  searchPlaceholder?: string
  emptyText?: string
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder = 'Buscar...',
  emptyText = 'No hay resultados.',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? data.filter((row) =>
        searchKeys.some((key) =>
          String(row[key] ?? '').toLowerCase().includes(search.toLowerCase())
        )
      )
    : data

  return (
    <div className="space-y-3">
      {searchKeys.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}
