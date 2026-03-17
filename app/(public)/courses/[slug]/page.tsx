'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CourseCurriculum } from '@/components/course/CourseCurriculum'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { formatPrice } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { usePurchase } from '@/hooks/usePurchase'
import type { Course, Module, Lesson } from '@/types/database'

interface ModuleWithLessons extends Module {
  lessons: Lesson[]
}

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { user } = useUser()
  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<ModuleWithLessons[]>([])
  const [loading, setLoading] = useState(true)
  const [payModalOpen, setPayModalOpen] = useState(false)

  const { hasPurchased } = usePurchase(course?.id ?? null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!courseData) {
        router.push('/')
        return
      }

      setCourse(courseData)

      const { data: mods } = await supabase
        .from('modules')
        .select('*, lessons(*)')
        .eq('course_id', courseData.id)
        .order('position')

      if (mods) {
        const sortedMods = mods.map((m: ModuleWithLessons) => ({
          ...m,
          lessons: [...(m.lessons || [])].sort((a: Lesson, b: Lesson) => a.position - b.position),
        }))
        setModules(sortedMods)
      }

      setLoading(false)
    }
    load()
  }, [slug, router])

  function handleBuyClick() {
    if (!user) {
      router.push('/login')
      return
    }
    setPayModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!course) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              {course.description && (
                <p className="mt-3 text-gray-600 leading-relaxed">{course.description}</p>
              )}
            </div>

            {modules.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Contenido del curso</h2>
                <CourseCurriculum
                  modules={modules}
                  courseSlug={slug}
                  hasPurchased={hasPurchased}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {course.cover_image && (
              <div className="relative aspect-video overflow-hidden rounded-xl">
                <Image src={course.cover_image} alt={course.title} fill className="object-cover" />
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
              <p className="text-3xl font-bold text-violet-600">
                {formatPrice(course.price, course.currency)}
              </p>

              {hasPurchased ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600 font-medium">✓ Ya tenés este curso</p>
                  {modules[0]?.lessons[0] && (
                    <Link href={`/courses/${slug}/${modules[0].lessons[0].id}`}>
                      <Button className="w-full" size="lg">Continuar aprendiendo</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <Button className="w-full" size="lg" onClick={handleBuyClick}>
                  Comprar ahora
                </Button>
              )}

              {!user && (
                <p className="text-center text-xs text-gray-400">
                  <Link href="/login" className="text-violet-600 hover:underline">
                    Iniciá sesión
                  </Link>{' '}
                  para comprar
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {course && payModalOpen && (
        <PaymentModal
          course={course}
          open={payModalOpen}
          onClose={() => setPayModalOpen(false)}
        />
      )}
    </div>
  )
}
