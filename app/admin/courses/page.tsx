'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Course } from '@/types/database'

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setCourses((data as Course[]) ?? []))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function toggleFeatured(course: Course) {
    const newValue = !course.is_featured
    setCourses((cs) => cs.map((c) => c.id === course.id ? { ...c, is_featured: newValue } : c))
    await supabase.from('courses').update({ is_featured: newValue }).eq('id', course.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
          <p className="text-sm text-gray-500 mt-1">{courses.length} cursos en total</p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuevo curso
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Título</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Oferta</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Destacado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No hay cursos. <Link href="/admin/courses/new" className="text-violet-600 hover:underline">Crear el primero</Link>
                </td>
              </tr>
            )}
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-xs text-gray-400">/{course.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {course.discount_price ? (
                    <div>
                      <span className="font-semibold text-violet-600">{formatPrice(course.discount_price, course.currency)}</span>
                      <span className="ml-1.5 text-xs text-gray-400 line-through">{formatPrice(course.price, course.currency)}</span>
                    </div>
                  ) : (
                    formatPrice(course.price, course.currency)
                  )}
                </td>
                <td className="px-4 py-3">
                  {course.offer_label ? (
                    <Badge variant="info">{course.offer_label}</Badge>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleFeatured(course)}
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                      course.is_featured
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`h-3 w-3 ${course.is_featured ? 'fill-amber-500' : ''}`} />
                    {course.is_featured ? 'Sí' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={course.is_published ? 'success' : 'default'}>
                    {course.is_published ? 'Publicado' : 'Borrador'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button size="sm" variant="ghost">
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
                      </Button>
                    </Link>
                    <Link href={`/admin/courses/${course.id}/curriculum`}>
                      <Button size="sm" variant="outline">Contenido</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
