import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/admin/StatsCard'
import { Badge } from '@/components/ui/badge'
import { Users, ShoppingBag, DollarSign, BookOpen, TrendingUp, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalUsers },
    { count: totalSales },
    { count: activeCourses },
    { count: featuredCourses },
    { data: revenueData },
    { data: monthRevenueData },
    { data: recentPurchases },
    { data: topCoursesData },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('purchases').select('*', { count: 'exact', head: true }).in('status', ['completed', 'manual']),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_featured', true).eq('is_published', true),
    supabase.from('purchases').select('amount').in('status', ['completed', 'manual']),
    supabase.from('purchases').select('amount').in('status', ['completed', 'manual']).gte('created_at', startOfMonth),
    supabase
      .from('purchases')
      .select('*, profiles(email, full_name), courses(title)')
      .in('status', ['completed', 'manual'])
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('purchases')
      .select('course_id, courses(title)')
      .in('status', ['completed', 'manual']),
  ])

  const totalRevenue = revenueData?.reduce((sum: number, p: { amount: number | null }) => sum + (p.amount ?? 0), 0) ?? 0
  const monthRevenue = monthRevenueData?.reduce((sum: number, p: { amount: number | null }) => sum + (p.amount ?? 0), 0) ?? 0

  // Count purchases per course
  const courseCounts: Record<string, { title: string; count: number }> = {}
  for (const p of topCoursesData ?? []) {
    const courseId = p.course_id as string
    const course = p.courses as { title: string } | null
    if (!courseCounts[courseId]) {
      courseCounts[courseId] = { title: course?.title ?? courseId, count: 0 }
    }
    courseCounts[courseId].count++
  }
  const topCourses = Object.values(courseCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de la plataforma</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard title="Usuarios registrados" value={totalUsers ?? 0} icon={Users} />
        <StatsCard title="Ventas aprobadas" value={totalSales ?? 0} icon={ShoppingBag} />
        <StatsCard title="Ingresos totales" value={formatPrice(totalRevenue)} icon={DollarSign} />
        <StatsCard title="Ingresos este mes" value={formatPrice(monthRevenue)} icon={TrendingUp} />
        <StatsCard title="Cursos publicados" value={activeCourses ?? 0} icon={BookOpen} />
        <StatsCard title="Cursos destacados" value={featuredCourses ?? 0} icon={Star} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Últimas ventas</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Comprador</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Curso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Proveedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPurchases?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Sin ventas aún.</td>
                  </tr>
                )}
                {recentPurchases?.map((p: Record<string, unknown>) => {
                  const profile = p.profiles as Record<string, unknown> | null
                  const course = p.courses as Record<string, unknown> | null
                  return (
                    <tr key={p.id as string} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">
                        {(profile?.full_name as string) || (profile?.email as string) || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{(course?.title as string) || '—'}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {p.amount ? formatPrice(p.amount as number, p.currency as string) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{p.provider as string}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Cursos más vendidos</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Curso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Ventas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topCourses.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-gray-400">Sin ventas aún.</td>
                  </tr>
                )}
                {topCourses.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{c.title}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-violet-600">{c.count}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
