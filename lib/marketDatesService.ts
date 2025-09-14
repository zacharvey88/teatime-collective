import { supabase } from './supabaseClient'

export interface MarketDate {
  id: string
  market_id: string
  date: string
  start_time: string
  end_time: string
  created_at?: string
  updated_at?: string
  // Joined market data
  market_name?: string
  market_location?: string
  market_url?: string
}

export interface CreateMarketDateData {
  market_id: string
  date: string
  start_time: string
  end_time: string
}

export class MarketDatesService {
  // Get all market dates with market info (admin)
  static async getMarketDates(): Promise<MarketDate[]> {
    const { data, error } = await supabase
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

    if (error) throw new Error('Failed to fetch market dates')
    
    // Transform the data to flatten the market info
    return data?.map(date => ({
      ...date,
      market_name: date.markets?.name,
      market_location: date.markets?.location,
      market_url: date.markets?.url
    })) || []
  }

  // Get active market dates with market info (frontend)
  static async getActiveMarketDates(): Promise<MarketDate[]> {
    const { data, error } = await supabase
      .from('market_dates')
      .select(`
        *,
        markets!inner(
          name,
          location,
          url
        )
      `)
      .eq('markets.active', true)
      .gte('date', new Date().toISOString().split('T')[0]) // Only future dates
      .order('date', { ascending: true })

    if (error) throw new Error('Failed to fetch active market dates')
    
    // Transform the data to flatten the market info
    return data?.map(date => ({
      ...date,
      market_name: date.markets?.name,
      market_location: date.markets?.location,
      market_url: date.markets?.url
    })) || []
  }

  // Get market dates for a specific market
  static async getMarketDatesByMarketId(marketId: string): Promise<MarketDate[]> {
    const { data, error } = await supabase
      .from('market_dates')
      .select(`
        *,
        markets!inner(
          name,
          location,
          url
        )
      `)
      .eq('market_id', marketId)
      .order('date', { ascending: true })

    if (error) throw new Error('Failed to fetch market dates for market')
    
    // Transform the data to flatten the market info
    return data?.map(date => ({
      ...date,
      market_name: date.markets?.name,
      market_location: date.markets?.location,
      market_url: date.markets?.url
    })) || []
  }

  // Create new market date
  static async createMarketDate(marketData: CreateMarketDateData): Promise<MarketDate> {
    const { data, error } = await supabase
      .from('market_dates')
      .insert([marketData])
      .select(`
        *,
        markets!inner(
          name,
          location,
          url
        )
      `)
      .single()

    if (error) throw new Error('Failed to create market date')
    
    // Transform the data to flatten the market info
    return {
      ...data,
      market_name: data.markets?.name,
      market_location: data.markets?.location,
      market_url: data.markets?.url,
      market_description: data.markets?.description
    }
  }

  // Update market date
  static async updateMarketDate(id: string, updates: Partial<MarketDate>): Promise<MarketDate> {
    // Remove market info from updates as it shouldn't be updated here
    const { market_name, market_location, market_url, ...dateUpdates } = updates
    
    const { data, error } = await supabase
      .from('market_dates')
      .update(dateUpdates)
      .eq('id', id)
      .select(`
        *,
        markets!inner(
          name,
          location,
          url
        )
      `)
      .single()

    if (error) throw new Error('Failed to update market date')
    
    // Transform the data to flatten the market info
    return {
      ...data,
      market_name: data.markets?.name,
      market_location: data.markets?.location,
      market_url: data.markets?.url,
      market_description: data.markets?.description
    }
  }

  // Delete market date
  static async deleteMarketDate(id: string): Promise<void> {
    const { error } = await supabase
      .from('market_dates')
      .delete()
      .eq('id', id)

    if (error) throw new Error('Failed to delete market date')
  }

  // Note: Market dates don't have an active status - they inherit from their parent market
} 