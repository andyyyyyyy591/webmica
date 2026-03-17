import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, courses(*)')
    .eq('user_id', user.id)
    .in('status', ['completed', 'manual'])
    .order('granted_at', { ascending: false })

  type CourseRow = { id: string; slug: string; title: string; cover_image: string | null }
  const courses = (purchases?.map((p) => (p as Record<string, unknown>).courses).filter(Boolean) ?? []) as CourseRow[]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Mi panel</h1>

        {courses.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <p className="text-gray-500">Todavía no tenés cursos.</p>
            <Link
              href="/"
              className="mt-3 inline-block text-sm font-medium text-violet-600 hover:underline"
            >
              Explorar cursos →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="relative aspect-video bg-gradient-to-br from-violet-100 to-purple-50">
                  {course.cover_image && (
                    <Image
                      src={course.cover_image!}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-sm text-violet-600 font-medium">Continuar →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
