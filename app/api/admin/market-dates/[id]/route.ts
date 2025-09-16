import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// PUT /api/admin/market-dates/[id] - Update market date
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const updates = await req.json()

    // Remove market info from updates as it shouldn't be updated here
    const { market_name, market_location, market_url, ...dateUpdates } = updates

    const { data, error } = await supabaseAdmin
      .from('market_dates')
      .update(dateUpdates)
      .eq('id', params.id)
      .select(`
        *,
        markets!inner(
          name,
          location,
          url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    // Transform the data to flatten the market info
    const transformedData = {
      ...data,
      market_name: data.markets?.name,
      market_location: data.markets?.location,
      market_url: data.markets?.website_url,
      markets: undefined // Remove the nested object
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/market-dates/[id] - Delete market date
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
      .from('market_dates')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Market date deleted successfully' })
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
