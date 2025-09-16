import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// PUT /api/admin/reviews/display-orders - Update display orders
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const updates = await req.json()

    const promises = updates.map((update: { id: string; display_order: number }) =>
      supabaseAdmin
        .from('reviews')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
    )

    const results = await Promise.all(promises)
    const hasError = results.some(result => result.error)

    if (hasError) {
      return NextResponse.json({ message: 'Failed to update display orders' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Display orders updated successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
