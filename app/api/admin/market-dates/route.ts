import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import supabaseAdmin from '@/lib/adminSupabaseClient'

// GET /api/admin/market-dates - Get all market dates
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('market_dates')
      .select(`
        *,
        markets!inner(
          name,
          location,
          url
        )
      `)
      .order('date', { ascending: true })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    // Transform the data to flatten the market info
    const transformedData = data?.map(item => ({
      ...item,
      market_name: item.markets?.name,
      market_location: item.markets?.location,
      market_url: item.markets?.website_url,
      markets: undefined // Remove the nested object
    })) || []

    return NextResponse.json(transformedData)
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/market-dates - Create new market date
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const marketDateData = await req.json()

    const { data, error } = await supabaseAdmin
      .from('market_dates')
      .insert([marketDateData])
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
