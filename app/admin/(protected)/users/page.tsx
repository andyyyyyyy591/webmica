import { createClient } from '@/lib/supabase/server'
import { UserTable } from './UserTable'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-sm text-gray-500 mt-1">{users?.length ?? 0} usuarios registrados</p>
      </div>

      <UserTable users={users ?? []} />
    </div>
  )
}
