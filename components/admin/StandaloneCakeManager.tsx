'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Upload,
  Image as ImageIcon,
  Loader2
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { CakeService, Cake } from '@/lib/cakeService'
import { supabase } from '@/lib/supabaseClient'

export default function StandaloneCakeManager() {
  const [cakes, setCakes] = useState<Cake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dialogError, setDialogError] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteCake, setDeleteCake] = useState<Cake | null>(null)
  const [editingCake, setEditingCake] = useState<Cake | null>(null)

  // Form states
  const [newCake, setNewCake] = useState({
    name: '',
    description: '',
    price: '',
    size_name: '',
    size_description: '',
    image_url: ''
  })

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadCakes()
  }, [])

  const loadCakes = async () => {
    try {
      setLoading(true)
      const data = await CakeService.getStandaloneCakes()
      setCakes(data)
    } catch (err) {
      setError('Failed to load standalone cakes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const uploadWithRetry = async (file: File, filePath: string, maxRetries = 2) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Upload attempt ${attempt}/${maxRetries}`)
        
        const uploadPromise = supabase.storage
          .from('images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        // Add timeout of 60 seconds
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout')), 60000)
        )

        const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any

        if (error) {
          console.error(`Upload error on attempt ${attempt}:`, error)
          if (attempt === maxRetries) {
            throw error
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          continue
        }

        return data
      } catch (err) {
        if (attempt === maxRetries) {
          throw err
        }
        console.log(`Attempt ${attempt} failed, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true)
      setError('')
      
      console.log('Starting image upload for file:', file.name, 'Size:', file.size)

      // Check file size (limit to 3MB for better performance)
      if (file.size > 3 * 1024 * 1024) {
        throw new Error('File size must be less than 3MB for better upload performance')
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a JPEG, PNG, or WebP image file')
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `cakes/${fileName}`
      
      console.log('Generated file path:', filePath)

      // Upload with retry mechanism
      console.log('Attempting to upload to Supabase...')
      const data = await uploadWithRetry(file, filePath)

      console.log('Upload successful:', data)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      console.log('Public URL:', urlData.publicUrl)
      return urlData.publicUrl

    } catch (err) {
      console.error('Image upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      if (errorMessage.includes('timeout')) {
        setError('Upload timeout - please try again with a smaller image or check your connection')
      } else {
        setError(`Upload failed: ${errorMessage}`)
      }
      throw err
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateCake = async () => {
    try {
      setDialogError('')
      
      // Validate required fields
      if (!newCake.name || !newCake.price || !newCake.size_name) {
        setDialogError('Please fill in all required fields')
        return
      }

      let imageUrl = newCake.image_url

      // Upload image if selected
      if (selectedImage) {
        imageUrl = await handleImageUpload(selectedImage)
      }

      const cakeData = {
        name: newCake.name,
        description: newCake.description || null,
        price: parseFloat(newCake.price),
        size_name: newCake.size_name,
        size_description: newCake.size_description || null,
        image_url: imageUrl,
        category_id: null, // Standalone cakes don't have categories
        flavor_id: null, // Standalone cakes don't have flavor_id
        cake_type: 'standalone' as const,
        display_order: cakes.length + 1,
        active: true
      }

      const createdCake = await CakeService.createCake(cakeData)
      setCakes(prev => [...prev, createdCake])
      
      // Reset form
      setNewCake({
        name: '',
        description: '',
        price: '',
        size_name: '',
        size_description: '',
        image_url: ''
      })
      setSelectedImage(null)
      setImagePreview(null)
      setIsCreateDialogOpen(false)
      
    } catch (err) {
      setDialogError('Failed to create cake')
      console.error(err)
    }
  }

  const handleEditCake = (cake: Cake) => {
    setEditingCake(cake)
    setNewCake({
      name: cake.name,
      description: cake.description || '',
      price: cake.price?.toString() || '0',
      size_name: cake.size_name || '',
      size_description: cake.size_description || '',
      image_url: cake.image_url || ''
    })
    setImagePreview(cake.image_url)
    setDialogError('') // Clear any previous dialog errors
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingCake) return

    try {
      setDialogError('')
      
      // Validate required fields
      if (!newCake.name || !newCake.price || !newCake.size_name) {
        setDialogError('Please fill in all required fields')
        return
      }

      let imageUrl = newCake.image_url

      // Upload new image if selected
      if (selectedImage) {
        try {
          imageUrl = await handleImageUpload(selectedImage)
        } catch (uploadError) {
          console.error('Image upload failed during edit:', uploadError)
          setDialogError(`Image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
          return
        }
      }

      const updates = {
        name: newCake.name,
        description: newCake.description || null,
        price: parseFloat(newCake.price),
        size_name: newCake.size_name,
        size_description: newCake.size_description || null,
        image_url: imageUrl
      }

      const updatedCake = await CakeService.updateCake(editingCake.id, updates)
      setCakes(prev => prev.map(cake => cake.id === editingCake.id ? updatedCake : cake))
      
      // Reset form
      setEditingCake(null)
      setNewCake({
        name: '',
        description: '',
        price: '',
        size_name: '',
        size_description: '',
        image_url: ''
      })
      setSelectedImage(null)
      setImagePreview(null)
      setIsEditDialogOpen(false)
      
    } catch (err) {
      console.error('Failed to update cake:', err)
      setDialogError(`Failed to update cake: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleDeleteCake = (cake: Cake) => {
    setDeleteCake(cake)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteCake) return

    try {
      await CakeService.deleteCake(deleteCake.id)
      setCakes(prev => prev.filter(cake => cake.id !== deleteCake.id))
      setDeleteCake(null)
      setIsDeleteDialogOpen(false)
    } catch (err) {
      setError('Failed to delete cake')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading standalone cakes...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Standalone Cakes</h2>
          <p className="text-gray-600">Manage individual cakes with custom pricing and sizing</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) {
            setDialogError('')
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-orange hover:bg-orange-900 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Standalone Cake
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border border-gray-200 shadow-lg">
            <DialogHeader>
              <DialogTitle>Add New Standalone Cake</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <Input
                  value={newCake.name}
                  onChange={(e) => setNewCake(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Biscoff Torte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={newCake.description}
                  onChange={(e) => setNewCake(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the cake..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={newCake.price}
                    onChange={(e) => setNewCake(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="45.00"
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size Name *</label>
                <Input
                  value={newCake.size_name}
                  onChange={(e) => setNewCake(prev => ({ ...prev, size_name: e.target.value }))}
                  placeholder="e.g., 12 inch, Standard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size Description</label>
                <Input
                  value={newCake.size_description}
                  onChange={(e) => setNewCake(prev => ({ ...prev, size_description: e.target.value }))}
                  placeholder="e.g., Serves 8-10 people"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <div 
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors relative overflow-hidden"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                          <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">Replace Image</span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm">Click to upload</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {dialogError && (
                <Alert variant="destructive">
                  <AlertDescription>{dialogError}</AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false)
                  setDialogError('')
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCake}
                  disabled={uploadingImage}
                  className="bg-orange hover:bg-orange-900 text-white"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Create Cake'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cakes.map((cake) => (
          <div key={cake.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-start space-x-3">
              {/* Image on the left */}
              <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {cake.image_url ? (
                  <img
                    src={cake.image_url}
                    alt={cake.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
              </div>
              
              {/* Cake info on the right */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{cake.name}</h3>
                    <p className="text-sm text-gray-600">{cake.size_name} - £{cake.price}</p>
                    {cake.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cake.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <Switch
                      checked={cake.active}
                      onCheckedChange={async (checked) => {
                        try {
                          await CakeService.updateCake(cake.id, { active: checked })
                          await loadCakes() // Refresh the data
                        } catch (error) {
                          console.error('Failed to update cake availability:', error)
                        }
                      }}
                      className="mr-2 [&>span]:!bg-white"
                      style={{
                        '--tw-bg-opacity': '1',
                        backgroundColor: cake.active ? 'var(--primary-color)' : '#d1d5db'
                      } as React.CSSProperties}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCake(cake)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCake(cake)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) {
          setDialogError('')
        }
      }}>
        <DialogContent className="max-w-md bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Edit Standalone Cake</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input
                value={newCake.name}
                onChange={(e) => setNewCake(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Biscoff Torte"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={newCake.description}
                onChange={(e) => setNewCake(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the cake..."
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">£</span>
                <Input
                  type="number"
                  step="0.01"
                  value={newCake.price}
                  onChange={(e) => setNewCake(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="45.00"
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size Name *</label>
              <Input
                value={newCake.size_name}
                onChange={(e) => setNewCake(prev => ({ ...prev, size_name: e.target.value }))}
                placeholder="e.g., 12 inch, Standard"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size Description</label>
              <Input
                value={newCake.size_description}
                onChange={(e) => setNewCake(prev => ({ ...prev, size_description: e.target.value }))}
                placeholder="e.g., Serves 8-10 people"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload-edit"
                />
                <div 
                  className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors relative overflow-hidden"
                  onClick={() => document.getElementById('image-upload-edit')?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white opacity-0 hover:opacity-100 text-sm font-medium">Replace Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">Click to upload</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {dialogError && (
              <Alert variant="destructive">
                <AlertDescription>{dialogError}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false)
                setDialogError('')
              }}>
                Cancel
              </Button>
                              <Button 
                  onClick={handleSaveEdit}
                  disabled={uploadingImage}
                  className="bg-orange hover:bg-orange-900 text-white"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                {uploadingImage && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setUploadingImage(false)
                      setError('Upload cancelled')
                    }}
                    className="ml-2"
                  >
                    Cancel Upload
                  </Button>
                )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>Delete Standalone Cake</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete "{deleteCake?.name}"?</p>
            <p className="text-sm text-gray-600">This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 