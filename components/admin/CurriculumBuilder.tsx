'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from './RichTextEditor'
import { ChevronDown, Trash2, Plus, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Module, Lesson } from '@/types/database'

interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}

interface CurriculumBuilderProps {
  courseId: string
  initialModules: ModuleWithLessons[]
}

export function CurriculumBuilder({ courseId, initialModules }: CurriculumBuilderProps) {
  const [modules, setModules] = useState<ModuleWithLessons[]>(initialModules)
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function addModule() {
    const title = prompt('Nombre del módulo:')
    if (!title) return
    const { data, error } = await supabase
      .from('modules')
      .insert({ course_id: courseId, title, position: modules.length })
      .select()
      .single()
    if (!error && data) {
      setModules([...modules, { ...data, lessons: [] }])
    }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm('¿Eliminar módulo y todas sus lecciones?')) return
    const { error } = await supabase.from('modules').delete().eq('id', moduleId)
    if (!error) setModules(modules.filter((m) => m.id !== moduleId))
  }

  async function addLesson(moduleId: string) {
    const title = prompt('Nombre de la lección:')
    if (!title) return
    const mod = modules.find((m) => m.id === moduleId)!
    const { data, error } = await supabase
      .from('lessons')
      .insert({ module_id: moduleId, title, position: mod.lessons.length })
      .select()
      .single()
    if (!error && data) {
      setModules(modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: [...m.lessons, data] } : m
      ))
    }
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm('¿Eliminar lección?')) return
    const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
    if (!error) {
      setModules(modules.map((m) =>
        m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
      ))
      if (expandedLesson === lessonId) setExpandedLesson(null)
    }
  }

  async function saveLesson(lessonId: string, content: Record<string, unknown>) {
    setSaving(true)
    await supabase.from('lessons').update({ content }).eq('id', lessonId)
    setSaving(false)
  }

  async function togglePreview(moduleId: string, lesson: Lesson) {
    const { error } = await supabase
      .from('lessons')
      .update({ is_preview: !lesson.is_preview })
      .eq('id', lesson.id)
    if (!error) {
      setModules(modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.map((l) => l.id === lesson.id ? { ...l, is_preview: !l.is_preview } : l) }
          : m
      ))
    }
  }

  return (
    <div className="space-y-4">
      {modules.map((mod) => (
        <div key={mod.id} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-3">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
            <h3 className="flex-1 font-semibold text-gray-900">{mod.title}</h3>
            <Button size="sm" variant="ghost" onClick={() => addLesson(mod.id)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Lección
            </Button>
            <button onClick={() => deleteModule(mod.id)} className="text-gray-400 hover:text-red-500 p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {mod.lessons.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">Sin lecciones. Agrega una.</p>
          )}

          {mod.lessons.map((lesson) => (
            <div key={lesson.id} className="border-t border-gray-100">
              <div className="flex items-center gap-2 px-4 py-2.5">
                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                <span
                  className="flex-1 cursor-pointer text-sm text-gray-700 hover:text-violet-600"
                  onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                >
                  {lesson.title}
                </span>
                <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lesson.is_preview}
                    onChange={() => togglePreview(mod.id, lesson)}
                    className="accent-violet-600"
                  />
                  Vista previa
                </label>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className={cn('h-4 w-4 transition-transform', expandedLesson === lesson.id && 'rotate-180')} />
                </button>
                <button onClick={() => deleteLesson(mod.id, lesson.id)} className="p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {expandedLesson === lesson.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                  <RichTextEditor
                    content={lesson.content}
                    lessonId={lesson.id}
                    onChange={(json) => saveLesson(lesson.id, json)}
                  />
                  {saving && <p className="text-xs text-violet-600">Guardando...</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <Button variant="outline" onClick={addModule}>
        <Plus className="mr-2 h-4 w-4" /> Agregar módulo
      </Button>
    </div>
  )
}
