import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// GET /api/admin/cake-sizes - Get all cake sizes
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('cake_sizes')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/cake-sizes - Create new cake size
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const sizeData = await req.json()

    const { data, error } = await supabaseAdmin
      .from('cake_sizes')
      .insert(sizeData)
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
