import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// GET /api/admin/reviews - Get all reviews
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/reviews - Create new review
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const reviewData = await req.json()

    // Get the next display order
    const { data: lastReview } = await supabaseAdmin
      .from('reviews')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextDisplayOrder = lastReview ? lastReview.display_order + 1 : 1

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert([{ ...reviewData, display_order: nextDisplayOrder }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
