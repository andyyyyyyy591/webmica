import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CourseCard } from '@/components/course/CourseCard'

export const revalidate = 60

export default async function HomePage() {
  const supabase = await createClient()
  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-600 to-purple-700 py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-bold sm:text-5xl">Transformá tu bienestar</h1>
          <p className="mt-4 text-lg text-violet-100">
            Cursos de psicología diseñados para acompañarte en tu camino de crecimiento personal.
          </p>
        </div>
      </section>

      {/* Catalog */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Cursos disponibles</h2>

        {!courses || courses.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
            <p>Próximamente nuevos cursos.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
