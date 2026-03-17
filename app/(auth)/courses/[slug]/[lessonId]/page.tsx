import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LessonSidebar } from '@/components/course/LessonSidebar'
import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import type { Module, Lesson } from '@/types/database'

interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}

export default async function LessonPage({
  params,
}: {
  params: { slug: string; lessonId: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch course
  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', params.slug)
    .single()

  if (!course) notFound()
  const courseData = course as { id: string; slug: string; title: string }

  // Check access: purchase or admin
  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as { role: string } | null
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin) {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseData.id)
      .in('status', ['completed', 'manual'])
      .maybeSingle()

    if (!purchase) redirect(`/courses/${params.slug}`)
  }

  // Fetch modules + lessons for sidebar
  const { data: mods } = await supabase
    .from('modules')
    .select('*, lessons(*)')
    .eq('course_id', courseData.id)
    .order('position')

  const modules: ModuleWithLessons[] = (mods ?? []).map((m: ModuleWithLessons) => ({
    ...m,
    lessons: [...(m.lessons || [])].sort((a: Lesson, b: Lesson) => a.position - b.position),
  }))

  // Fetch current lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', params.lessonId)
    .single()

  if (!lesson) notFound()
  const lessonData = lesson as { id: string; title: string; content: Record<string, unknown> | null }

  // Render rich text content
  let html = ''
  if (lessonData.content) {
    html = generateHTML(lessonData.content as Parameters<typeof generateHTML>[0], [
      StarterKit,
      Image,
      Link,
    ])
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <LessonSidebar modules={modules} courseSlug={params.slug} />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">{lessonData.title}</h1>
          {html ? (
            <div
              className="prose prose-violet max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="text-gray-400">Esta lección no tiene contenido aún.</p>
          )}
        </div>
      </main>
    </div>
  )
}
