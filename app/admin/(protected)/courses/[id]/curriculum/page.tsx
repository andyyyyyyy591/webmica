import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CurriculumBuilder } from '@/components/admin/CurriculumBuilder'
import type { Module, Lesson } from '@/types/database'

interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}

export default async function CurriculumPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('id', params.id)
    .single()

  if (!course) notFound()

  const { data: mods } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', params.id)
    .order('position')

  const modules: ModuleWithLessons[] = (mods ?? []).map((m: ModuleWithLessons) => ({
    ...m,
    lessons: [...(m.lessons || [])].sort((a: Lesson, b: Lesson) => a.position - b.position),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/courses" className="text-xs text-violet-600 hover:underline">← Volver a cursos</Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Contenido: {course.title}</h1>
        </div>
        <Link href={`/admin/courses/${params.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          Editar detalles →
        </Link>
      </div>

      <CurriculumBuilder courseId={params.id} initialModules={modules} />
    </div>
  )
}
