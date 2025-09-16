import { supabase } from './supabaseClient'

export interface Market {
  id: string
  name: string
  location: string
  url?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateMarketData {
  name: string
  location: string
  url?: string
  active?: boolean
}

export interface UpdateMarketData {
  name?: string
  location?: string
  url?: string
  active?: boolean
}

export class MarketService {
  // Get all markets (admin)
  static async getMarkets(): Promise<Market[]> {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw new Error('Failed to fetch markets')
    return data || []
  }

  // Get active markets (frontend)
  static async getActiveMarkets(): Promise<Market[]> {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) throw new Error('Failed to fetch active markets')
    return data || []
  }

  // Get market by ID
  static async getMarketById(id: string): Promise<Market> {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error('Failed to fetch market')
    return data
  }

  // Create new market
  static async createMarket(marketData: CreateMarketData): Promise<Market> {
    try {
      const response = await fetch('/api/admin/markets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marketData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create market')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating market:', error)
      throw error
    }
  }

  // Update market
  static async updateMarket(id: string, updates: UpdateMarketData): Promise<Market> {
    try {
      const response = await fetch(`/api/admin/markets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update market')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating market:', error)
      throw error
    }
  }

  // Delete market (this will also delete all associated market dates due to CASCADE)
  static async deleteMarket(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/markets/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete market')
      }
    } catch (error) {
      console.error('Error deleting market:', error)
      throw error
    }
  }

  // Toggle market active status
  static async toggleActive(id: string, active: boolean): Promise<Market> {
    return this.updateMarket(id, { active })
  }

  // Search markets by name or location
  static async searchMarkets(query: string): Promise<Market[]> {
    const { data, error } = await supabase
      .from('markets')
      .select('*')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
      .order('name', { ascending: true })

    if (error) throw new Error('Failed to search markets')
    return data || []
  }

  // Get markets with their upcoming dates
  static async getMarketsWithUpcomingDates(): Promise<Array<Market & { upcoming_dates: Array<{ id: string; date: string; start_time: string; end_time: string }> }>> {
    const { data, error } = await supabase
      .from('markets')
      .select(`
        *,
        market_dates!inner(
          id,
          date,
          start_time,
          end_time
        )
      `)
      .eq('active', true)
      .gte('market_dates.date', new Date().toISOString().split('T')[0])
      .order('name', { ascending: true })

    if (error) throw new Error('Failed to fetch markets with upcoming dates')
    
    // Transform the data to match our interface
    return data?.map(market => ({
      ...market,
      upcoming_dates: market.market_dates || []
    })) || []
  }
}
