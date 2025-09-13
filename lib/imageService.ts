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
    const tableName = this.getTableName(type)
    
    const { data, error } = await supabase
      .from(tableName)
      .insert([imageData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create ${type} image: ${error.message}`)
    }

    return data
  }

  // Update an existing image
  static async updateImage(type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes', id: string, updates: Partial<ImageItem>): Promise<ImageItem> {
    const tableName = this.getTableName(type)
    
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update ${type} image: ${error.message}`)
    }

    return data
  }

  // Delete an image (soft delete by setting active to false)
  static async deleteImage(type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes', id: string): Promise<void> {
    const tableName = this.getTableName(type)
    
    const { error } = await supabase
      .from(tableName)
      .update({ active: false })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete ${type} image: ${error.message}`)
    }
  }

  // Reorder images by updating their order_index values
  static async reorderImages(type: 'carousel' | 'weddings' | 'festivals' | 'custom_cakes', imageIds: string[]): Promise<void> {
    const tableName = this.getTableName(type)
    
    // Update each image individually to avoid null constraint issues
    for (let i = 0; i < imageIds.length; i++) {
      const { error } = await supabase
        .from(tableName)
        .update({ order_index: i })
        .eq('id', imageIds[i])

      if (error) {
        throw new Error(`Failed to reorder ${type} images: ${error.message}`)
      }
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