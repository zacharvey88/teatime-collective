import { supabase } from './supabaseClient'

export interface CakeCategory {
  id: string
  name: string
  description: string | null
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface CakeSize {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface CakeFlavor {
  id: string
  category_id: string
  name: string
  description: string | null
  image_url: string | null
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

export interface CakeWithDetails {
  category: CakeCategory
  sizes: CakeSize[]
  flavors: CakeFlavor[]
}

export class CakeService {
  // Get all cake categories
  static async getCategories(): Promise<CakeCategory[]> {
    const { data, error } = await supabase
      .from('cake_categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get all cake sizes
  static async getSizes(): Promise<CakeSize[]> {
    const { data, error } = await supabase
      .from('cake_sizes')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get all cake flavors
  static async getFlavors(): Promise<CakeFlavor[]> {
    const { data, error } = await supabase
      .from('cake_flavors')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get complete cake data organized by category
  static async getCakesByCategory(): Promise<CakeWithDetails[]> {
    const { data: categories, error: categoriesError } = await supabase
      .from('cake_categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })
    
    if (categoriesError) throw categoriesError

    const result: CakeWithDetails[] = []

    for (const category of categories || []) {
      // Get sizes for this category
      const { data: sizes, error: sizesError } = await supabase
        .from('cake_sizes')
        .select('*')
        .eq('category_id', category.id)
        .eq('active', true)
        .order('display_order', { ascending: true })
      
      if (sizesError) throw sizesError

      // Get flavors for this category
      const { data: flavors, error: flavorsError } = await supabase
        .from('cake_flavors')
        .select('*')
        .eq('category_id', category.id)
        .eq('active', true)
        .order('display_order', { ascending: true })
      
      if (flavorsError) throw flavorsError

      result.push({
        category,
        sizes: sizes || [],
        flavors: flavors || []
      })
    }

    return result
  }

  // Create a new category
  static async createCategory(category: Omit<CakeCategory, 'id' | 'created_at' | 'updated_at'>): Promise<CakeCategory> {
    const { data, error } = await supabase
      .from('cake_categories')
      .insert(category)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Update a category
  static async updateCategory(id: string, updates: Partial<CakeCategory>): Promise<CakeCategory> {
    const { data, error } = await supabase
      .from('cake_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Delete a category (soft delete)
  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('cake_categories')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }

  // Create a new size
  static async createSize(size: Omit<CakeSize, 'id' | 'created_at' | 'updated_at'>): Promise<CakeSize> {
    const { data, error } = await supabase
      .from('cake_sizes')
      .insert(size)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Update a size
  static async updateSize(id: string, updates: Partial<CakeSize>): Promise<CakeSize> {
    const { data, error } = await supabase
      .from('cake_sizes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Delete a size (soft delete)
  static async deleteSize(id: string): Promise<void> {
    const { error } = await supabase
      .from('cake_sizes')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }

  // Create a new flavor
  static async createFlavor(flavor: Omit<CakeFlavor, 'id' | 'created_at' | 'updated_at'>): Promise<CakeFlavor> {
    const { data, error } = await supabase
      .from('cake_flavors')
      .insert(flavor)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Update a flavor
  static async updateFlavor(id: string, updates: Partial<CakeFlavor>): Promise<CakeFlavor> {
    const { data, error } = await supabase
      .from('cake_flavors')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  // Delete a flavor (soft delete)
  static async deleteFlavor(id: string): Promise<void> {
    const { error } = await supabase
      .from('cake_flavors')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }

  // Get a specific size by ID
  static async getSizeById(id: string): Promise<CakeSize | null> {
    const { data, error } = await supabase
      .from('cake_sizes')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  }

  // Get a specific flavor by ID
  static async getFlavorById(id: string): Promise<CakeFlavor | null> {
    const { data, error } = await supabase
      .from('cake_flavors')
      .select('*')
      .eq('id', id)
      .eq('active', true)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null // No rows returned
      throw error
    }
    return data
  }
} 