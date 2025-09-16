import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// GET /api/admin/contact-info - Get contact info
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('contact_info')
      .select('*')
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data || null)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/contact-info - Update contact info
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const contactData = await req.json()

    // Get the first record (there should only be one)
    const { data: existing } = await supabaseAdmin
      .from('contact_info')
      .select('id')
      .limit(1)
      .single()

    if (existing) {
      // Update existing record
      const { data, error } = await supabaseAdmin
        .from('contact_info')
        .update({
          ...contactData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // Create new record
      const { data, error } = await supabaseAdmin
        .from('contact_info')
        .insert([{
          ...contactData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
