'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon,
  Plus,
  Loader2
} from 'lucide-react'
import { ImageService, ImageItem } from '@/lib/imageService'

type ImageType = 'carousel' | 'weddings' | 'festivals'

const imageTypes: { type: ImageType; label: string }[] = [
  { type: 'carousel', label: 'Carousel Images' },
  { type: 'weddings', label: 'Wedding Images' },
  { type: 'festivals', label: 'Festival Images' }
]

export default function ImagesManager() {
  const [activeTab, setActiveTab] = useState<ImageType>('carousel')
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputEmptyRef = useRef<HTMLInputElement>(null)

  // Load images when active tab changes
  useEffect(() => {
    loadImages()
  }, [activeTab])

  const loadImages = async () => {
    try {
      setLoading(true)
      const data = await ImageService.getImages(activeTab)
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
        const url = await ImageService.uploadImage(file, activeTab)
        
        // Get next order index
        const nextOrderIndex = await ImageService.getNextOrderIndex(activeTab)
        
        // Create image record in database
        const altText = file.name.replace(/\.[^/.]+$/, '')
        await ImageService.createImage(activeTab, {
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
      await ImageService.deleteImage(activeTab, id)
      await loadImages()
    } catch (err: any) {
      setError(err.message || 'Failed to delete image')
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const index = images.findIndex(img => img.id === id)
    if (index === -1) return

    const newImages = [...images]
    if (direction === 'up' && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]]
    } else if (direction === 'down' && index < images.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
    }

    try {
      // Update order_index values in database
      const imageIds = newImages.map(img => img.id)
      await ImageService.reorderImages(activeTab, imageIds)
      
      // Reload images to get the updated order
      await loadImages()
    } catch (err: any) {
      setError(err.message || 'Failed to reorder images')
    }
  }

  const handleAltTextChange = async (id: string, altText: string) => {
    try {
      await ImageService.updateImage(activeTab, id, { alt_text: altText })
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
        <h1 className="text-3xl font-bold text-gray mb-2">Image Management</h1>
        <p className="text-gray-600">Manage images for different sections of your website</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {imageTypes.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === type
                  ? 'border-orange text-orange'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

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
              <div key={image.id} className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="relative aspect-[4/5] bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.alt_text}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-orange text-white text-sm font-bold px-3 py-2 rounded-lg shadow-lg">
                    #{image.order_index + 1}
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div>
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
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMove(image.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMove(image.id, 'down')}
                        disabled={index === images.length - 1}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(image.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Image Card - only show when images exist */}
            {images.length > 0 && (
              <div className="border-dashed border-2 border-gray-300 hover:border-orange transition-colors flex items-center justify-center bg-white rounded-lg">
                <div className="p-6">
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
                </div>
              </div>
            )}
          </div>

          {/* Empty state - only show when no images exist */}
          {images.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
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
            </div>
          )}
        </>
      )}
    </div>
  )
} 