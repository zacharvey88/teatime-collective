import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// GET /api/admin/images - Get images by type
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as 'carousel' | 'weddings' | 'festivals' | 'custom_cakes'

    if (!type) {
      return NextResponse.json({ message: 'Type parameter is required' }, { status: 400 })
    }

    const tableName = getTableName(type)
    
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/images - Create new image
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { type, ...imageData } = await req.json()

    if (!type) {
      return NextResponse.json({ message: 'Type is required' }, { status: 400 })
    }

    const tableName = getTableName(type)
    
    const { data, error } = await supabaseAdmin
      .from(tableName)
      .insert([imageData])
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
