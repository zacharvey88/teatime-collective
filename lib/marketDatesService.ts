import { supabase } from './supabaseClient'

export interface MarketDate {
  id: string
  name: string
  date: string
  start_time: string
  end_time: string
  location: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateMarketDateData {
  name: string
  date: string
  start_time: string
  end_time: string
  location: string
  active?: boolean
}

export class MarketDatesService {
  // Get all market dates (admin)
  static async getMarketDates(): Promise<MarketDate[]> {
    const { data, error } = await supabase
      .from('market_dates')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw new Error('Failed to fetch market dates')
    return data || []
  }

  // Get active market dates (frontend)
  static async getActiveMarketDates(): Promise<MarketDate[]> {
    const { data, error } = await supabase
      .from('market_dates')
      .select('*')
      .eq('active', true)
      .gte('date', new Date().toISOString().split('T')[0]) // Only future dates
      .order('date', { ascending: true })

    if (error) throw new Error('Failed to fetch active market dates')
    return data || []
  }

  // Create new market date
  static async createMarketDate(marketData: CreateMarketDateData): Promise<MarketDate> {
    const { data, error } = await supabase
      .from('market_dates')
      .insert([marketData])
      .select()
      .single()

    if (error) throw new Error('Failed to create market date')
    return data
  }

  // Update market date
  static async updateMarketDate(id: string, updates: Partial<MarketDate>): Promise<MarketDate> {
    const { data, error } = await supabase
      .from('market_dates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error('Failed to update market date')
    return data
  }

  // Delete market date
  static async deleteMarketDate(id: string): Promise<void> {
    const { error } = await supabase
      .from('market_dates')
      .delete()
      .eq('id', id)

    if (error) throw new Error('Failed to delete market date')
  }

  // Toggle market date active status
  static async toggleActive(id: string, active: boolean): Promise<MarketDate> {
    return this.updateMarketDate(id, { active })
  }
} 