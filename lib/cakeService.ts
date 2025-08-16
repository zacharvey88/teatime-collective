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
  category_id: string | null // Now optional
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
  category_id: string | null // Now optional
  name: string
  description?: string | null
  image_url: string | null
  price_override: number | null // Allows flavor-specific pricing
  display_order: number
  active: boolean
  created_at: string
  updated_at: string
}

// New interface for standalone cakes
export interface Cake {
  id: string
  name: string
  description: string | null
  image_url: string | null
  price: number | null
  size_name: string | null
  size_description: string | null
  category_id: string | null
  flavor_id: string | null
  cake_type: 'standalone' | 'category_flavor'
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

export interface CakeDisplayData {
  standaloneCakes: Cake[]
  categoryCakes: CakeWithDetails[]
}

export class CakeService {
  // Get all standalone cakes
  static async getStandaloneCakes(): Promise<Cake[]> {
    const { data, error } = await supabase
      .from('cakes')
      .select('*')
      .eq('cake_type', 'standalone')
      .eq('active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get all standalone cakes for admin (includes inactive items)
  static async getStandaloneCakesForAdmin(): Promise<Cake[]> {
    const { data, error } = await supabase
      .from('cakes')
      .select('*')
      .eq('cake_type', 'standalone')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data || []
  }

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

  // Get all cake sizes (including those without categories)
  static async getSizes(): Promise<CakeSize[]> {
    const { data, error } = await supabase
      .from('cake_sizes')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get all cake flavors (including those without categories)
  static async getFlavors(): Promise<CakeFlavor[]> {
    const { data, error } = await supabase
      .from('cakes')
      .select('*')
      .eq('cake_type', 'category_flavor')
      .eq('active', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get complete cake data organized by category (existing functionality)
  static async getCakesByCategory(): Promise<CakeWithDetails[]> {
    const { data: categories, error: categoriesError } = await supabase
      .from('cake_categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true })
    
    if (categoriesError) throw categoriesError

    const result: CakeWithDetails[] = []

    for (const category of categories || []) {
      // Get sizes for this category (from cake_sizes table)
      const { data: sizes, error: sizesError } = await supabase
        .from('cake_sizes')
        .select('*')
        .eq('category_id', category.id)
        .eq('active', true)
        .order('display_order', { ascending: true })
      
      if (sizesError) throw sizesError

      // Get flavors for this category (from cakes table)
      const { data: flavors, error: flavorsError } = await supabase
        .from('cakes')
        .select('*')
        .eq('category_id', category.id)
        .eq('cake_type', 'category_flavor')
        .eq('active', true)
        .order('display_order', { ascending: true })
      
      if (flavorsError) throw flavorsError

      // Include all categories, even those without sizes or flavors
      result.push({
        category,
        sizes: sizes || [],
        flavors: flavors || []
      })
    }

    return result
  }

  // Get complete cake data organized by category for admin (includes inactive items)
  static async getCakesByCategoryForAdmin(): Promise<CakeWithDetails[]> {
    const { data: categories, error: categoriesError } = await supabase
      .from('cake_categories')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (categoriesError) throw categoriesError

    const result: CakeWithDetails[] = []

    for (const category of categories || []) {
      // Get sizes for this category (from cake_sizes table)
      const { data: sizes, error: sizesError } = await supabase
        .from('cake_sizes')
        .select('*')
        .eq('category_id', category.id)
        .order('display_order', { ascending: true })
      
      if (sizesError) throw sizesError

      // Get flavors for this category (from cakes table)
      const { data: flavors, error: flavorsError } = await supabase
        .from('cakes')
        .select('*')
        .eq('category_id', category.id)
        .eq('cake_type', 'category_flavor')
        .order('display_order', { ascending: true })
      
      if (flavorsError) throw flavorsError

      // Include all categories, even those without sizes or flavors
      result.push({
        category,
        sizes: sizes || [],
        flavors: flavors || []
      })
    }

    return result
  }

  // Get all cake data (standalone + category-based)
  static async getAllCakes(): Promise<CakeDisplayData> {
    const [standaloneCakes, categoryCakes] = await Promise.all([
      this.getStandaloneCakes(),
      this.getCakesByCategory()
    ])

    return {
      standaloneCakes,
      categoryCakes
    }
  }

  // CRUD operations for standalone cakes
  static async createCake(cake: Omit<Cake, 'id' | 'created_at' | 'updated_at'>): Promise<Cake> {
    const { data, error } = await supabase
      .from('cakes')
      .insert(cake)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async updateCake(id: string, updates: Partial<Cake>): Promise<Cake> {
    const { data, error } = await supabase
      .from('cakes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  static async deleteCake(id: string): Promise<void> {
    const { error } = await supabase
      .from('cakes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // CRUD operations for cake categories
  static async createCategory(category: Omit<CakeCategory, 'id' | 'created_at' | 'updated_at'>): Promise<CakeCategory> {
    const { data, error } = await supabase
      .from('cake_categories')
      .insert(category)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

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

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('cake_categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // CRUD operations for cake sizes (using cake_sizes table)
  static async createSize(size: Omit<CakeSize, 'id' | 'created_at' | 'updated_at'>): Promise<CakeSize> {
    const { data, error } = await supabase
      .from('cake_sizes')
      .insert(size)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

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

  static async deleteSize(id: string): Promise<void> {
    const { error } = await supabase
      .from('cake_sizes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // CRUD operations for cake flavors (now with optional category_id)
  static async createFlavor(flavor: Omit<CakeFlavor, 'id' | 'created_at' | 'updated_at'>): Promise<CakeFlavor> {
    const cakeData = {
      name: flavor.name,
      description: flavor.description,
      image_url: flavor.image_url,
      category_id: flavor.category_id,
      price_override: flavor.price_override,
      cake_type: 'category_flavor' as const,
      display_order: flavor.display_order,
      active: flavor.active
    }
    
    const { data, error } = await supabase
      .from('cakes')
      .insert(cakeData)
      .select()
      .single()
    
    if (error) throw error
    return data as CakeFlavor
  }

  static async updateFlavor(id: string, updates: Partial<CakeFlavor>): Promise<CakeFlavor> {
    const cakeUpdates = {
      name: updates.name,
      description: updates.description,
      image_url: updates.image_url,
      category_id: updates.category_id,
      price_override: updates.price_override,
      display_order: updates.display_order,
      active: updates.active,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('cakes')
      .update(cakeUpdates)
      .eq('id', id)
      .eq('cake_type', 'category_flavor')
      .select()
      .single()
    
    if (error) throw error
    return data as CakeFlavor
  }

  static async deleteFlavor(id: string): Promise<void> {
    const { error } = await supabase
      .from('cakes')
      .delete()
      .eq('id', id)
      .eq('cake_type', 'category_flavor')
    
    if (error) throw error
  }

  // Utility methods
  static async getSizeById(id: string): Promise<CakeSize | null> {
    const { data, error } = await supabase
      .from('cake_sizes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  }

  static async getFlavorById(id: string): Promise<CakeFlavor | null> {
    const { data, error } = await supabase
      .from('cakes')
      .select('*')
      .eq('id', id)
      .eq('cake_type', 'category_flavor')
      .single()
    
    if (error) return null
    return data as CakeFlavor
  }

  static async getCakeById(id: string): Promise<Cake | null> {
    const { data, error } = await supabase
      .from('cakes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  }
} 