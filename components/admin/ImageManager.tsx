'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  Plus,
  Loader2,
  GripVertical
} from 'lucide-react'
import { ImageService, ImageItem } from '@/lib/imageService'

interface ImageManagerProps {
  title: string
  type: 'carousel' | 'weddings' | 'festivals'
}

export default function ImageManager({ title, type }: ImageManagerProps) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [draggedImage, setDraggedImage] = useState<ImageItem | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputEmptyRef = useRef<HTMLInputElement>(null)

  // Load images on component mount
  useEffect(() => {
    loadImages()
  }, [type])

  const loadImages = async () => {
    try {
      setLoading(true)
      const data = await ImageService.getImages(type)
      setImages(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load images')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      for (const file of Array.from(files)) {
        // Upload file to Supabase Storage
        const url = await ImageService.uploadImage(file, type)
        
        // Get next order index
        const nextOrderIndex = await ImageService.getNextOrderIndex(type)
        
        // Create image record in database
        const altText = file.name.replace(/\.[^/.]+$/, '')
        await ImageService.createImage(type, {
          url,
          alt_text: altText,
          order_index: nextOrderIndex
        })
      }

      // Reload images to get the updated list
      await loadImages()
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await ImageService.deleteImage(type, id)
      await loadImages()
    } catch (err: any) {
      setError(err.message || 'Failed to delete image')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, image: ImageItem) => {
    setDraggedImage(image)
    e.dataTransfer.effectAllowed = 'move'
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
    
    if (!draggedImage) return

    const dragIndex = images.findIndex(img => img.id === draggedImage.id)
    if (dragIndex === -1 || dragIndex === dropIndex) {
      setDraggedImage(null)
      setDragOverIndex(null)
      return
    }

    // Create new array with reordered images
    const newImages = [...images]
    const [draggedItem] = newImages.splice(dragIndex, 1)
    newImages.splice(dropIndex, 0, draggedItem)

    // Update local state immediately for better UX
    setImages(newImages)
    setDraggedImage(null)
    setDragOverIndex(null)

    try {
      // Update order_index values in database
      const imageIds = newImages.map(img => img.id)
      await ImageService.reorderImages(type, imageIds)
    } catch (err: any) {
      setError(err.message || 'Failed to reorder images')
      // Revert local state on error
      await loadImages()
    }
  }

  const handleDragEnd = () => {
    setDraggedImage(null)
    setDragOverIndex(null)
  }

  const handleAltTextChange = async (id: string, altText: string) => {
    try {
      await ImageService.updateImage(type, id, { alt_text: altText })
      // Update local state immediately for better UX
      setImages(images.map(img => 
        img.id === id ? { ...img, alt_text: altText } : img
      ))
    } catch (err: any) {
      setError(err.message || 'Failed to update image')
    }
  }



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray mb-2">{title}</h1>
        <p className="text-gray-600">Manage images for the {type} section</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange" />
          <span className="ml-2 text-gray-600">Loading images...</span>
        </div>
      ) : (
        <>
          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {images.map((image, index) => (
              <Card 
                key={image.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, image)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`overflow-hidden transition-all duration-200 ${
                  draggedImage?.id === image.id 
                    ? 'opacity-50 scale-95' 
                    : dragOverIndex === index 
                    ? 'ring-2 ring-orange-500 border-orange-500' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="relative aspect-[4/5] bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.alt_text}
                    className="w-full h-full object-cover"
                  />
                  {/* Drag handle */}
                  <div className="absolute top-3 left-3 bg-black bg-opacity-50 text-white p-1 rounded cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image Label
                        </label>
                        <Input
                          value={image.alt_text}
                          onChange={(e) => handleAltTextChange(image.id, e.target.value)}
                          placeholder="Add a description of the image"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(image.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 h-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Image Card - only show when images exist */}
            {images.length > 0 && (
              <Card className="border-dashed border-2 border-gray-300 hover:border-orange transition-colors flex items-center justify-center">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-center space-y-4">
                    <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Add new images</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Upload Images
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Empty state - only show when no images exist */}
          {images.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No images yet</h3>
                <p className="text-gray-500 mb-4">Upload your first image to get started</p>
                <input
                  ref={fileInputEmptyRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  className="bg-orange hover:bg-orange-900" 
                  onClick={() => fileInputEmptyRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Images
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
} 