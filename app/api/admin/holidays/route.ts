import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// GET /api/admin/holidays - Get all holidays
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('holidays')
      .select('*')
      .order('start_date', { ascending: true })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/holidays - Create new holiday
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const holidayData = await req.json()

    const { data, error } = await supabaseAdmin
      .from('holidays')
      .insert({
        ...holidayData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
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
