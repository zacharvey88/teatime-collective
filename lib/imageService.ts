import { supabase } from './supabaseClient'

export interface ImageItem {
  id: string
  url: string
  alt_text: string
  order_index: number
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateImageData {
  url: string
  alt_text: string
  order_index: number
  active?: boolean
}

export class ImageService {
  private static getTableName(type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes'): string {
    switch (type) {
      case 'carousel':
        return 'carousel_images'
      case 'weddings':
        return 'wedding_images'
      case 'festivals':
        return 'festival_images'
      case 'custom_cakes':
        return 'custom_cake_images'
      default:
        throw new Error(`Invalid image type: ${type}`)
    }
  }

  // Get all images for a specific type, ordered by order_index
  static async getImages(type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes'): Promise<ImageItem[]> {
    const tableName = this.getTableName(type)
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch ${type} images: ${error.message}`)
    }

    return data || []
  }

  // Create a new image
  static async createImage(type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes', imageData: CreateImageData): Promise<ImageItem> {
    try {
      const response = await fetch('/api/admin/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, ...imageData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to create ${type} image`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error creating ${type} image:`, error)
      throw error
    }
  }

  // Update an existing image
  static async updateImage(type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes', id: string, updates: Partial<ImageItem>): Promise<ImageItem> {
    try {
      const response = await fetch(`/api/admin/images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, ...updates }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to update ${type} image`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error updating ${type} image:`, error)
      throw error
    }
  }

  // Delete an image (soft delete by setting active to false)
  static async deleteImage(type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes', id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/images/${id}?type=${type}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to delete ${type} image`)
      }
    } catch (error) {
      console.error(`Error deleting ${type} image:`, error)
      throw error
    }
  }

  // Reorder images by updating their order_index values
  static async reorderImages(type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes', imageIds: string[]): Promise<void> {
    try {
      const response = await fetch('/api/admin/images/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, imageIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to reorder ${type} images`)
      }
    } catch (error) {
      console.error(`Error reordering ${type} images:`, error)
      throw error
    }
  }

  // Upload image file to Supabase Storage
  static async uploadImage(file: File, type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes'): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${type}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  // Get the next available order_index for a new image
  static async getNextOrderIndex(type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes'): Promise<number> {
    const images = await this.getImages(type)
    return images.length
  }
} 