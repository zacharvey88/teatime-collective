import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// PUT /api/admin/images/[id] - Update image
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { type, ...updates } = await req.json()

    if (!type) {
      return NextResponse.json({ message: 'Type is required' }, { status: 400 })
    }

    const tableName = getTableName(type)
    
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .update(updates)
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

// DELETE /api/admin/images/[id] - Delete image (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as 'carousel' | 'weddings' | 'festivals' | 'custom_cakes'

    if (!type) {
      return NextResponse.json({ message: 'Type parameter is required' }, { status: 400 })
    }

    const tableName = getTableName(type)
    
    const { error } = await supabaseAdmin
      .from(tableName)
      .update({ active: false })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Image deleted successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

function getTableName(type: string): string {
  switch (type) {
    case 'carousel':
      return 'carousel_images'
    case 'weddings':
      return 'wedding_images'
    case 'festivals':
      return 'festival_images'
    case 'custom_cakes':
      return 'custom_cake_images'
    default:
      throw new Error(`Invalid image type: ${type}`)
  }
}
