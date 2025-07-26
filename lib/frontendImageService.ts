import { supabase } from './supabaseClient'

export interface FrontendImageItem {
  id: string
  url: string
  alt_text: string
  order_index: number
}

export class FrontendImageService {
  // Get carousel images for the frontend
  static async getCarouselImages(): Promise<FrontendImageItem[]> {
    const { data, error } = await supabase
      .from('carousel_images')
      .select('id, url, alt_text, order_index')
      .eq('active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Failed to fetch carousel images:', error)
      return []
    }

    return data || []
  }

  // Get wedding images for the frontend
  static async getWeddingImages(): Promise<FrontendImageItem[]> {
    const { data, error } = await supabase
      .from('wedding_images')
      .select('id, url, alt_text, order_index')
      .eq('active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Failed to fetch wedding images:', error)
      return []
    }

    return data || []
  }

  // Get festival images for the frontend
  static async getFestivalImages(): Promise<FrontendImageItem[]> {
    const { data, error } = await supabase
      .from('festival_images')
      .select('id, url, alt_text, order_index')
      .eq('active', true)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Failed to fetch festival images:', error)
      return []
    }

    return data || []
  }
} 