import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Course } from '@/types/database'

export default async function AdminCourses() {
  const supabase = await createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
          <p className="text-sm text-gray-500 mt-1">{courses?.length ?? 0} cursos en total</p>
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
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {courses?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No hay cursos. <Link href="/admin/courses/new" className="text-violet-600 hover:underline">Crear el primero</Link>
                </td>
              </tr>
            )}
            {courses?.map((course: Course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{course.title}</p>
                    <p className="text-xs text-gray-400">/{course.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{formatPrice(course.price, course.currency)}</td>
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
