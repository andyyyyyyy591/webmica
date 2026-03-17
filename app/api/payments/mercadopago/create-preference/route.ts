import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createPreference } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { courseId } = await request.json()

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  // Fetch course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, price, currency')
    .eq('id', courseId)
    .single()

  if (courseError || !course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  // Check for existing completed purchase
  const { data: existingPurchase } = await supabase
    .from('purchases')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle()

  if (existingPurchase?.status === 'completed' || existingPurchase?.status === 'manual') {
    return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
  }

  // Create or reuse pending purchase row using admin client (bypasses RLS)
  const adminClient = await createAdminClient()
  let purchaseId: string

  if (existingPurchase) {
    purchaseId = existingPurchase.id
  } else {
    const { data: newPurchase, error: purchaseError } = await adminClient
      .from('purchases')
      .insert({
        user_id: user.id,
        course_id: courseId,
        status: 'pending',
        provider: 'mercadopago',
        amount: course.price,
        currency: course.currency,
      })
      .select('id')
      .single()

    if (purchaseError || !newPurchase) {
      return NextResponse.json({ error: 'Could not create purchase record' }, { status: 500 })
    }

    purchaseId = newPurchase.id
  }

  // Create MP preference
  const preference = await createPreference({
    courseTitle: course.title,
    price: course.price,
    purchaseId,
  })

  return NextResponse.json({ preferenceId: preference.id })
}
