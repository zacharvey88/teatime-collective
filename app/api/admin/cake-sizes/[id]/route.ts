import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// PUT /api/admin/cake-sizes/[id] - Update cake size
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const sizeData = await req.json()

    const { data, error } = await supabaseAdmin
      .from('cake_sizes')
      .update({ ...sizeData, updated_at: new Date().toISOString() })
      .eq('id', params.id)
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

// DELETE /api/admin/cake-sizes/[id] - Delete cake size
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('cake_sizes')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Cake size deleted successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
