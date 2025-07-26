import { supabase } from './supabaseClient'

export interface CakeFlavor {
  id: string
  name: string
  description: string | null
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CakeSize {
  id: string
  name: string
  description: string | null
  base_price: number
  frilly_price: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CakePreset {
  id: string
  name: string
  description: string | null
  image_url: string | null
  flavors: string[]
  available_sizes: string[]
  pricing: Record<string, string>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CakeCardData {
  id: string
  name: string
  image: string
  description: string
  flavors: string[]
  pricing: Record<string, string>
  availableSizes: ('regular' | 'frilly' | 'wedding')[]
}

export class CakeService {
  // Get all active cake flavors
  static async getCakeFlavors(): Promise<CakeFlavor[]> {
    const { data, error } = await supabase
      .from('cake_flavors')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw new Error(`Failed to fetch cake flavors: ${error.message}`)
    return data || []
  }

  // Get all active cake sizes
  static async getCakeSizes(): Promise<CakeSize[]> {
    const { data, error } = await supabase
      .from('cake_sizes')
      .select('*')
      .eq('is_active', true)
      .order('base_price')
    
    if (error) throw new Error(`Failed to fetch cake sizes: ${error.message}`)
    return data || []
  }

  // Get all active cake presets
  static async getCakePresets(): Promise<CakePreset[]> {
    const { data, error } = await supabase
      .from('cake_presets')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw new Error(`Failed to fetch cake presets: ${error.message}`)
    return data || []
  }

  // Get cake data formatted for the cakes page
  static async getCakesForPage(): Promise<CakeCardData[]> {
    try {
      const presets = await this.getCakePresets()
      
      return presets.map(preset => ({
        id: preset.id,
        name: preset.name,
        image: preset.image_url || '/images/carousel-01.jpg', // fallback image
        description: preset.description || '',
        flavors: preset.flavors || [],
        pricing: preset.pricing || {},
        availableSizes: (preset.available_sizes || []).map(size => {
          // Map database size names to expected types
          if (size === '6 inch' || size === '8 inch' || size === '10 inch' || size === '12 inch') {
            return 'regular' as const
          }
          return 'regular' as const // fallback to regular
        })
      }))
    } catch (error) {
      console.error('Error fetching cakes for page:', error)
      return []
    }
  }

  // Get cake flavor by ID
  static async getCakeFlavor(id: string): Promise<CakeFlavor | null> {
    const { data, error } = await supabase
      .from('cake_flavors')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw new Error(`Failed to fetch cake flavor: ${error.message}`)
    return data
  }

  // Get cake size by ID
  static async getCakeSize(id: string): Promise<CakeSize | null> {
    const { data, error } = await supabase
      .from('cake_sizes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw new Error(`Failed to fetch cake size: ${error.message}`)
    return data
  }

  // Get cake preset by ID
  static async getCakePreset(id: string): Promise<CakePreset | null> {
    const { data, error } = await supabase
      .from('cake_presets')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw new Error(`Failed to fetch cake preset: ${error.message}`)
    return data
  }
} 