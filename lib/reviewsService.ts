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
      const response = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create review')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating review:', error)
      throw error
    }
  }

  // Update a review
  static async updateReview(id: string, reviewData: UpdateReviewData): Promise<Review> {
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update review')
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating review:', error)
      throw error
    }
  }

  static async deleteReview(id: string): Promise<void> {
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete review')
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  }

  // Update display orders for multiple reviews
  static async updateDisplayOrders(updates: { id: string; display_order: number }[]): Promise<void> {
    try {
      const response = await fetch('/api/admin/reviews/display-orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update display orders')
      }
    } catch (error) {
      console.error('Error updating display orders:', error)
      throw error
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
