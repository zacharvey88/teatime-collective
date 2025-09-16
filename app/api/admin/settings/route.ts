import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// GET /api/admin/settings - Get settings
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const settingsData = await req.json()

    // First, get the current settings to get the ID
    const { data: currentSettings, error: fetchError } = await supabaseAdmin
      .from('settings')
      .select('id')
      .limit(1)
      .single()

    if (fetchError || !currentSettings) {
      return NextResponse.json({ message: 'No settings found to update' }, { status: 404 })
    }

    const { data, error } = await supabaseAdmin
      .from('settings')
      .update({
        ...settingsData,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentSettings.id)
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
