import { createClient } from '@/lib/supabase/server'
import { PurchasesTable } from './PurchasesTable'

export default async function AdminPurchasesPage() {
  const supabase = await createClient()
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, profiles(email, full_name), courses(title, slug)')
    .order('created_at', { ascending: false })

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .order('email')

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('title')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
        <p className="text-sm text-gray-500 mt-1">{purchases?.length ?? 0} registros</p>
      </div>

      <PurchasesTable
        purchases={purchases ?? []}
        allUsers={users ?? []}
        allCourses={courses ?? []}
      />
    </div>
  )
}
