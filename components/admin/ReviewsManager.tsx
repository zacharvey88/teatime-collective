'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Star, Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { ReviewsService, Review, CreateReviewData, UpdateReviewData } from '@/lib/reviewsService'
import { toast } from 'sonner'
import LoadingSpinner from '@/components/ui/loading-spinner'

const ReviewsManager = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteReview, setDeleteReview] = useState<Review | null>(null)
  
  // Drag and drop state
  const [draggedReview, setDraggedReview] = useState<Review | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    customer_name: '',
    rating: 5,
    review_text: '',
    display_order: 0,
    is_active: true
  })

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      const data = await ReviewsService.getAllReviews()
      setReviews(data)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const resetForm = useCallback(() => {
    setFormData({
      customer_name: '',
      rating: 5,
      review_text: '',
      display_order: 0,
      is_active: true
    })
  }, [])

  const openCreateDialog = useCallback(() => {
    resetForm()
    setFormData(prev => ({ ...prev, display_order: reviews.length + 1 }))
    setIsCreateDialogOpen(true)
  }, [resetForm, reviews.length])

  const openEditDialog = (review: Review) => {
    setSelectedReview(review)
    setFormData({
      customer_name: review.customer_name,
      rating: review.rating,
      review_text: review.review_text,
      display_order: review.display_order,
      is_active: review.is_active
    })
    setIsEditDialogOpen(true)
  }

  const handleCreate = useCallback(async () => {
    try {
      const createData: CreateReviewData = {
        customer_name: formData.customer_name,
        rating: formData.rating,
        review_text: formData.review_text,
        display_order: formData.display_order,
        is_active: formData.is_active
      }

      await ReviewsService.createReview(createData)
      toast.success('Review created successfully')
      setIsCreateDialogOpen(false)
      resetForm()
      fetchReviews()
    } catch (error: any) {
      toast.error(`Failed to create review: ${error.message || 'Unknown error'}`)
    }
  }, [formData, resetForm, fetchReviews])

  const handleUpdate = async () => {
    if (!selectedReview) return

    try {
      const updateData: UpdateReviewData = {
        customer_name: formData.customer_name,
        rating: formData.rating,
        review_text: formData.review_text,
        display_order: formData.display_order,
        is_active: formData.is_active
      }

      await ReviewsService.updateReview(selectedReview.id, updateData)
      toast.success('Review updated successfully')
      setIsEditDialogOpen(false)
      setSelectedReview(null)
      resetForm()
      fetchReviews()
    } catch (error: any) {
      toast.error('Failed to update review')
    }
  }

  const handleDelete = (review: Review) => {
    setDeleteReview(review)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteReview) return

    try {
      await ReviewsService.deleteReview(deleteReview.id)
      toast.success('Review deleted successfully')
      setIsDeleteDialogOpen(false)
      setDeleteReview(null)
      fetchReviews()
    } catch (error: any) {
      toast.error(`Failed to delete review: ${error.message || 'Unknown error'}`)
    }
  }

  const handleToggleStatus = async (review: Review) => {
    try {
      await ReviewsService.toggleReviewStatus(review.id)
      toast.success(`Review ${review.is_active ? 'hidden' : 'shown'} successfully`)
      fetchReviews()
    } catch (error: any) {
      toast.error('Failed to update review status')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, review: Review) => {
    setDraggedReview(review)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (!draggedReview) return

    const dragIndex = reviews.findIndex(review => review.id === draggedReview.id)
    if (dragIndex === dropIndex) {
      setDragOverIndex(null)
      setDraggedReview(null)
      return
    }

    // Create new array with reordered reviews
    const newReviews = [...reviews]
    const [draggedItem] = newReviews.splice(dragIndex, 1)
    newReviews.splice(dropIndex, 0, draggedItem)

    // Update display_order for all affected reviews
    const updatedReviews = newReviews.map((review, index) => ({
      ...review,
      display_order: index
    }))

    setReviews(updatedReviews)
    setDragOverIndex(null)
    setDraggedReview(null)

    // Update display_order in database
    try {
      const updatePromises = updatedReviews.map((review, index) => 
        ReviewsService.updateReview(review.id, { display_order: index })
      )
      await Promise.all(updatePromises)
      toast.success('Review order updated successfully')
    } catch (error: any) {
      toast.error('Failed to update review order')
      // Revert on error
      fetchReviews()
    }
  }

  const handleDragEnd = () => {
    setDragOverIndex(null)
    setDraggedReview(null)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleCancelForm = useCallback(() => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    resetForm()
  }, [resetForm])

  const renderReviewForm = useCallback((onSubmit: () => void, submitLabel: string) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Customer Name</label>
        <Input
          value={formData.customer_name}
          onChange={(e) => handleFormChange('customer_name', e.target.value)}
          placeholder="e.g., Sarah M."
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Rating</label>
        <div className="flex items-center space-x-2 mt-1">
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleFormChange('rating', i + 1)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 ${i < formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            </button>
          ))}
          <span className="text-sm text-gray-600 ml-2">{formData.rating}/5</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Review Text</label>
        <Textarea
          value={formData.review_text}
          onChange={(e) => handleFormChange('review_text', e.target.value)}
          placeholder="Enter the review text..."
          rows={4}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Display Order</label>
        <Input
          type="number"
          value={formData.display_order}
          onChange={(e) => handleFormChange('display_order', parseInt(e.target.value) || 0)}
          min="0"
          placeholder="0"
        />
        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => handleFormChange('is_active', checked)}
          style={{ backgroundColor: formData.is_active ? 'var(--primary-color)' : '#d1d5db' }}
          className="[&>span]:!bg-white"
        />
        <label className="text-sm font-medium">Active (visible on website)</label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelForm}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!formData.customer_name || !formData.review_text}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  ), [formData, handleFormChange, handleCancelForm])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner message="Loading reviews..." />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <CardTitle>Reviews Manager</CardTitle>
            <div className="flex items-center space-x-2">
              {/* Removed connection status display */}
              {/* Removed connection test button */}
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-orange hover:bg-orange/90 text-white border-orange"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle>Add New Review</DialogTitle>
              </DialogHeader>
              {renderReviewForm(handleCreate, "Create Review")}
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-gray-600">
          Manage customer reviews that appear on your website. You can add reviews manually and control which ones are displayed.
        </p>
      </CardHeader>

      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <Card 
                key={review.id} 
                className={`
                  ${!review.is_active ? 'opacity-60' : ''} 
                  ${draggedReview?.id === review.id ? 'opacity-50 scale-95' : ''}
                  ${dragOverIndex === index ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}
                  transition-all duration-200 cursor-move
                `}
                draggable
                onDragStart={(e) => handleDragStart(e, review)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                      <div>
                        <h4 className="font-medium">{review.customer_name}</h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(review)}
                        disabled={false}
                      >
                        {review.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(review)}
                        disabled={false}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(review)}
                        disabled={false}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{review.review_text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Edit Review</DialogTitle>
            </DialogHeader>
            {renderReviewForm(handleUpdate, "Update Review")}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-white border border-gray-200 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-red-600">
                Confirm Delete
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-gray-700">
                {deleteReview && (
                  <>
                    <p className="mb-2">
                      Are you sure you want to delete this review?
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="font-medium text-red-800">
                        Review by "{deleteReview.customer_name}"
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">{renderStars(deleteReview.rating)}</div>
                      </div>
                      <p className="text-sm text-red-600 mt-2 line-clamp-2">
                        "{deleteReview.review_text}"
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteDialogOpen(false)
                    setDeleteReview(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Review
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default ReviewsManager
