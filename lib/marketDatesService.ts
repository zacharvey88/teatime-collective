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
    try {
      const response = await fetch('/api/admin/market-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create market date')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating market date:', error)
      throw error
    }
  }

  // Update market date
  static async updateMarketDate(id: string, updates: Partial<MarketDate>): Promise<MarketDate> {
    try {
      const response = await fetch(`/api/admin/market-dates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update market date')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating market date:', error)
      throw error
    }
  }

  // Delete market date
  static async deleteMarketDate(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/market-dates/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete market date')
      }
    } catch (error) {
      console.error('Error deleting market date:', error)
      throw error
    }
  }

  // Note: Market dates don't have an active status - they inherit from their parent market
} 