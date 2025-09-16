import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// PUT /api/admin/images/reorder - Reorder images
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { type, imageIds } = await req.json()

    if (!type || !imageIds || !Array.isArray(imageIds)) {
      return NextResponse.json({ message: 'Type and imageIds array are required' }, { status: 400 })
    }

    const tableName = getTableName(type)

    const promises = imageIds.map((id: string, index: number) =>
      supabaseAdmin
        .from(tableName)
        .update({ order_index: index })
        .eq('id', id)
    )

    const results = await Promise.all(promises)
    const hasError = results.some(result => result.error)

    if (hasError) {
      return NextResponse.json({ message: 'Failed to reorder images' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Images reordered successfully' })
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
