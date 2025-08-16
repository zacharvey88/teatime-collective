import { supabase } from './supabaseClient'

export interface Review {
  id: string
  customer_name: string
  rating: number
  review_text: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateReviewData {
  customer_name: string
  rating: number
  review_text: string
  display_order?: number
  is_active?: boolean
}

export interface UpdateReviewData {
  customer_name?: string
  rating?: number
  review_text?: string
  display_order?: number
  is_active?: boolean
}

export class ReviewsService {
  // Get all reviews for admin (includes inactive)
  static async getAllReviews(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch reviews')
    }

    return data || []
  }

  // Get active reviews for public display
  static async getActiveReviews(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error('Failed to fetch reviews')
    }

    return data || []
  }

  // Get a single review by ID
  static async getReviewById(id: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return null
    }

    return data
  }

  // Create a new review
  static async createReview(reviewData: CreateReviewData): Promise<Review> {
    try {
      // Get the next display order
      const { data: existingReviews } = await supabase
        .from('reviews')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)

      const nextOrder = existingReviews && existingReviews.length > 0 
        ? (existingReviews[0].display_order || 0) + 1 
        : 1

      reviewData.display_order = nextOrder

      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create review: ${error.message}`)
      }

      return data
    } catch (error) {
      throw error
    }
  }

  // Update a review
  static async updateReview(id: string, reviewData: UpdateReviewData): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .update(reviewData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update review: ${error.message}`)
    }

    return data
  }

  // Delete a review
  static async deleteReview(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete review: ${error.message}`)
    }
  }

  // Update display orders for multiple reviews
  static async updateDisplayOrders(updates: { id: string; display_order: number }[]): Promise<void> {
    const promises = updates.map(update =>
      supabase
        .from('reviews')
        .update({ display_order: update.display_order })
        .eq('id', update.id)
    )

    const results = await Promise.all(promises)
    
    for (const result of results) {
      if (result.error) {
        throw new Error('Failed to update display orders')
      }
    }
  }

  // Toggle review active status
  static async toggleReviewStatus(id: string): Promise<Review> {
    const review = await this.getReviewById(id)
    if (!review) {
      throw new Error('Review not found')
    }

    return this.updateReview(id, { is_active: !review.is_active })
  }
}
