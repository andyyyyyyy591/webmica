'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Module, Lesson } from '@/types/database'

interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}

interface LessonSidebarProps {
  modules: ModuleWithLessons[]
  courseSlug: string
}

export function LessonSidebar({ modules, courseSlug }: LessonSidebarProps) {
  const params = useParams()
  const currentLessonId = params.lessonId as string
  const [openModules, setOpenModules] = useState<Set<string>>(new Set(modules.map((m) => m.id)))

  function toggleModule(id: string) {
    setOpenModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  return (
    <nav className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto h-full">
      <div className="p-4">
        <Link href={`/courses/${courseSlug}`} className="text-xs font-medium text-violet-600 hover:underline">
          ← Volver al curso
        </Link>
      </div>
      <div className="divide-y divide-gray-200">
        {modules.map((mod) => (
          <div key={mod.id}>
            <button
              onClick={() => toggleModule(mod.id)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {mod.title}
              </span>
              <ChevronDown
                className={cn('h-3.5 w-3.5 text-gray-400 transition-transform', {
                  'rotate-180': openModules.has(mod.id),
                })}
              />
            </button>

            {openModules.has(mod.id) && (
              <div className="pb-1">
                {mod.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/courses/${courseSlug}/${lesson.id}`}
                    className={cn(
                      'block px-5 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors',
                      lesson.id === currentLessonId &&
                        'bg-violet-50 text-violet-700 font-medium border-r-2 border-violet-600'
                    )}
                  >
                    {lesson.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  )
}
