import { supabase } from './supabaseClient'

export interface CakeCategory {
  id: string
  name: string
  description: string | null
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
  cake_type: 'standalone' | 'categorised'
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
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get all standalone cakes for admin (includes inactive items)
  static async getStandaloneCakesForAdmin(): Promise<Cake[]> {
    const { data, error } = await supabase
      .from('cakes')
      .select('*')
      .eq('cake_type', 'standalone')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get all cake categories
  static async getCategories(): Promise<CakeCategory[]> {
    const { data, error } = await supabase
      .from('cake_categories')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get all cake sizes (including those without categories)
  static async getSizes(): Promise<CakeSize[]> {
    const { data, error } = await supabase
      .from('cake_sizes')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get all cake flavors (including those without categories)
  static async getFlavors(): Promise<CakeFlavor[]> {
    const { data, error } = await supabase
      .from('cakes')
      .select('*')
      .eq('cake_type', 'categorised')
      .eq('active', true)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  // Get complete cake data organized by category (existing functionality)
  static async getCakesByCategory(): Promise<CakeWithDetails[]> {
    const { data: categories, error: categoriesError } = await supabase
      .from('cake_categories')
      .select('*')
      .eq('active', true)
      .order('name', { ascending: true })
    
    if (categoriesError) throw categoriesError

    // Custom sorting: put Cheesecakes at the end
    const sortedCategories = (categories || []).sort((a, b) => {
      // Check for various possible cheesecake names
      const aIsCheesecake = a.name.toLowerCase().includes('cheesecake')
      const bIsCheesecake = b.name.toLowerCase().includes('cheesecake')
      
      if (aIsCheesecake && !bIsCheesecake) return 1
      if (!aIsCheesecake && bIsCheesecake) return -1
      return a.name.localeCompare(b.name)
    })

    const result: CakeWithDetails[] = []

    for (const category of sortedCategories) {
      // Get sizes for this category (from cake_sizes table)
      const { data: sizes, error: sizesError } = await supabase
        .from('cake_sizes')
        .select('*')
        .eq('category_id', category.id)
        .eq('active', true)
        .order('name', { ascending: true })
      
      if (sizesError) throw sizesError

      // Get flavors for this category (from cakes table)
      const { data: flavors, error: flavorsError } = await supabase
        .from('cakes')
        .select('*')
        .eq('category_id', category.id)
        .eq('cake_type', 'categorised')
        .eq('active', true)
        .order('name', { ascending: true })
      
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
      .order('name', { ascending: true })
    
    if (categoriesError) throw categoriesError

    // Debug logging to see the order
    console.log('Categories before sorting:', categories?.map(c => c.name))

    // Custom sorting: put Cheesecakes at the end
    const sortedCategories = (categories || []).sort((a, b) => {
      // Check for various possible cheesecake names
      const aIsCheesecake = a.name.toLowerCase().includes('cheesecake')
      const bIsCheesecake = b.name.toLowerCase().includes('cheesecake')
      
      if (aIsCheesecake && !bIsCheesecake) return 1
      if (!aIsCheesecake && bIsCheesecake) return -1
      return a.name.localeCompare(b.name)
    })
    
    console.log('Categories after sorting:', sortedCategories.map(c => c.name))

    const result: CakeWithDetails[] = []

    for (const category of sortedCategories) {
      // Get sizes for this category (from cake_sizes table)
      const { data: sizes, error: sizesError } = await supabase
        .from('cake_sizes')
        .select('*')
        .eq('category_id', category.id)
        .order('name', { ascending: true })
      
      if (sizesError) throw sizesError

      // Get flavors for this category (from cakes table)
      const { data: flavors, error: flavorsError } = await supabase
        .from('cakes')
        .select('*')
        .eq('category_id', category.id)
        .eq('cake_type', 'categorised')
        .order('name', { ascending: true })
      
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
    try {
      const response = await fetch('/api/admin/cakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cake),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create cake')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating cake:', error)
      throw error
    }
  }

  static async updateCake(id: string, updates: Partial<Cake>): Promise<Cake> {
    try {
      const response = await fetch(`/api/admin/cakes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update cake')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating cake:', error)
      throw error
    }
  }

  static async deleteCake(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/cakes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete cake')
      }
    } catch (error) {
      console.error('Error deleting cake:', error)
      throw error
    }
  }

  // CRUD operations for cake categories
  static async createCategory(category: Omit<CakeCategory, 'id' | 'created_at' | 'updated_at'>): Promise<CakeCategory> {
    try {
      const response = await fetch('/api/admin/cake-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create category')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  static async updateCategory(id: string, updates: Partial<CakeCategory>): Promise<CakeCategory> {
    try {
      const response = await fetch(`/api/admin/cake-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update category')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  }

  static async deleteCategory(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/cake-categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  // CRUD operations for cake sizes (using cake_sizes table)
  static async createSize(size: Omit<CakeSize, 'id' | 'created_at' | 'updated_at'>): Promise<CakeSize> {
    try {
      const response = await fetch('/api/admin/cake-sizes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(size),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create size')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating size:', error)
      throw error
    }
  }

  static async updateSize(id: string, updates: Partial<CakeSize>): Promise<CakeSize> {
    try {
      const response = await fetch(`/api/admin/cake-sizes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update size')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating size:', error)
      throw error
    }
  }

  static async deleteSize(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/cake-sizes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete size')
      }
    } catch (error) {
      console.error('Error deleting size:', error)
      throw error
    }
  }

  // CRUD operations for cake flavors (now with optional category_id)
  static async createFlavor(flavor: Omit<CakeFlavor, 'id' | 'created_at' | 'updated_at'>): Promise<CakeFlavor> {
    try {
      const cakeData = {
        name: flavor.name,
        description: flavor.description,
        image_url: flavor.image_url,
        category_id: flavor.category_id,
        price_override: flavor.price_override,
        cake_type: 'categorised' as const,
        active: flavor.active
      }

      const response = await fetch('/api/admin/cakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cakeData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create flavor')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating flavor:', error)
      throw error
    }
  }

  static async updateFlavor(id: string, updates: Partial<CakeFlavor>): Promise<CakeFlavor> {
    try {
      const cakeUpdates = {
        name: updates.name,
        description: updates.description,
        image_url: updates.image_url,
        category_id: updates.category_id,
        price_override: updates.price_override,
        active: updates.active,
        updated_at: new Date().toISOString()
      }

      const response = await fetch(`/api/admin/cakes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cakeUpdates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update flavor')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating flavor:', error)
      throw error
    }
  }

  static async deleteFlavor(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/cakes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete flavor')
      }
    } catch (error) {
      console.error('Error deleting flavor:', error)
      throw error
    }
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
      .eq('cake_type', 'categorised')
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