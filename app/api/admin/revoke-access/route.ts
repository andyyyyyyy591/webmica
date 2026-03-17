import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, courseId } = await request.json()

  if (!userId || !courseId) {
    return NextResponse.json({ error: 'userId and courseId are required' }, { status: 400 })
  }

  const adminClient = await createAdminClient()
  const { error } = await adminClient
    .from('purchases')
    .delete()
    .eq('user_id', userId)
    .eq('course_id', courseId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
