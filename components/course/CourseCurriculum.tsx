'use client'

import { useState } from 'react'
import { ChevronDown, Lock, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Module, Lesson } from '@/types/database'

interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}

interface CourseCurriculumProps {
  modules: ModuleWithLessons[]
  courseSlug: string
  hasPurchased?: boolean
}

export function CourseCurriculum({ modules, hasPurchased }: CourseCurriculumProps) {
  const [openModules, setOpenModules] = useState<Set<string>>(new Set([modules[0]?.id]))

  function toggleModule(id: string) {
    setOpenModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  if (!modules.length) return <p className="text-sm text-gray-500">No hay contenido aún.</p>

  return (
    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200">
      {modules.map((mod) => (
        <div key={mod.id}>
          <button
            onClick={() => toggleModule(mod.id)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="font-medium text-gray-900">{mod.title}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{mod.lessons.length} lecciones</span>
              <ChevronDown
                className={cn('h-4 w-4 text-gray-400 transition-transform', {
                  'rotate-180': openModules.has(mod.id),
                })}
              />
            </div>
          </button>

          {openModules.has(mod.id) && (
            <div className="border-t border-gray-100 bg-gray-50">
              {mod.lessons.map((lesson) => {
                const isAccessible = hasPurchased || lesson.is_preview
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between px-5 py-2.5 text-sm"
                  >
                    <span className={cn('text-gray-700', !isAccessible && 'text-gray-400')}>
                      {lesson.title}
                    </span>
                    <span className="ml-2 shrink-0">
                      {lesson.is_preview ? (
                        <span className="text-xs text-violet-600 flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Vista previa
                        </span>
                      ) : !isAccessible ? (
                        <Lock className="h-3.5 w-3.5 text-gray-400" />
                      ) : null}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
